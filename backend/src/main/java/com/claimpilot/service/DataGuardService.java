package com.claimpilot.service;

import com.claimpilot.dto.dataguard.DataGuardRunDto;
import com.claimpilot.entity.Claim;
import com.claimpilot.entity.ClaimCode;
import com.claimpilot.entity.DataGuardCheck;
import com.claimpilot.entity.DataGuardRun;
import com.claimpilot.entity.DataGuardSeverity;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.exception.ApiException;
import com.claimpilot.repository.ClaimRepository;
import com.claimpilot.repository.DataGuardRunRepository;
import com.claimpilot.repository.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class DataGuardService {

        private static final String SOURCE = "Claim Intake";
        private static final java.util.regex.Pattern ICD10_PATTERN = java.util.regex.Pattern
                        .compile("^[A-Z][0-9][A-Z0-9](?:\\.[A-Z0-9]{1,4})?$");
        private static final java.util.regex.Pattern PROCEDURE_CODE_PATTERN = java.util.regex.Pattern
                        .compile("^(?:\\d{5}|[A-Z]\\d{4})$");

        private final ClaimRepository claimRepository;
        private final DataGuardRunRepository runRepository;
        private final UserAccountRepository userRepository;
        private final AuditService auditService;

        public DataGuardService(ClaimRepository claimRepository,
                        DataGuardRunRepository runRepository,
                        UserAccountRepository userRepository,
                        AuditService auditService) {
                this.claimRepository = claimRepository;
                this.runRepository = runRepository;
                this.userRepository = userRepository;
                this.auditService = auditService;
        }

        @Transactional
        public DataGuardRunDto run(String claimNumber, String actorId) {
                Claim claim = requireClaim(claimNumber);
                UserAccount actor = requireUser(actorId);
                List<DataGuardCheck> checks = evaluate(claim);

                int valid = count(checks, DataGuardSeverity.VALID);
                int missing = count(checks, DataGuardSeverity.MISSING);
                int invalid = count(checks, DataGuardSeverity.INVALID);
                int inconsistent = count(checks, DataGuardSeverity.INCONSISTENT);
                int duplicates = count(checks, DataGuardSeverity.WARNING);
                int score = Math.max(0, 100 - missing * 10 - invalid * 15 - inconsistent * 10 - duplicates * 5);

                DataGuardRun run = new DataGuardRun(
                                claim, actor, score, valid, missing, invalid, inconsistent, duplicates);
                checks.forEach(run::addItem);
                claim.setDataQualityScore(BigDecimal.valueOf(score));
                DataGuardRun saved = runRepository.saveAndFlush(run);
                auditService.record(actorId, "DATAGUARD_COMPLETED", "CLAIM", claimNumber,
                                "Validation score=" + score + "; invalid=" + invalid + "; missing=" + missing + ".");
                return DataGuardRunDto.from(saved);
        }

        @Transactional(readOnly = true)
        public List<DataGuardRunDto> listForClaim(String claimNumber) {
                if (!claimRepository.existsByClaimNumber(claimNumber)) {
                        throw new ApiException("Claim not found.", HttpStatus.NOT_FOUND);
                }
                return runRepository.findByClaim_ClaimNumberOrderByLastCheckedDesc(claimNumber)
                                .stream().map(DataGuardRunDto::from).toList();
        }

        @Transactional(readOnly = true)
        public DataGuardRunDto getRun(String runId) {
                DataGuardRun run = runRepository.findById(runId)
                                .orElseThrow(() -> new ApiException("DataGuard run not found.", HttpStatus.NOT_FOUND));
                return DataGuardRunDto.from(run);
        }

        private List<DataGuardCheck> evaluate(Claim claim) {
                List<DataGuardCheck> checks = new ArrayList<>();
                required(checks, "Claimant Full Legal Name", claim.getClaimantName());
                required(checks, "Policy Number", claim.getPolicyNumber());
                required(checks, "Hospital Name", claim.getHospitalName());
                required(checks, "Claim Type", claim.getClaimType());
                validateNpi(checks, claim.getHospitalNpi());
                validateDateRange(checks, claim.getAdmissionDate(), claim.getDischargeDate());
                validateMoney(checks, "Claim Amount", claim.getClaimAmount(), null);
                validateMoney(checks, "Copay Amount", claim.getCopayAmount(), claim.getClaimAmount());
                validateMoney(checks, "Approved Amount", claim.getApprovedAmount(), claim.getClaimAmount());
                checks.add(new DataGuardCheck(
                                "Claim Currency", SOURCE, claim.getCurrency(), "INR",
                                "INR".equals(claim.getCurrency()) ? DataGuardSeverity.VALID : DataGuardSeverity.INVALID,
                                "INR".equals(claim.getCurrency()) ? "Valid" : "Invalid",
                                "Claim amount currency is " + claim.getCurrency() + ".",
                                "Claim financial values must be recorded in INR."));
                validateCodeSet(checks, "Diagnosis Code", claim.getDiagnosisCodes(), ICD10_PATTERN,
                                "ICD-10 code format");
                validateCodeSet(checks, "Procedure Code", claim.getProcedureCodes(), PROCEDURE_CODE_PATTERN,
                                "CPT or HCPCS code format");

                boolean duplicate = claimRepository
                                .existsByPolicyNumberIgnoreCaseAndClaimantNameIgnoreCaseAndHospitalNameIgnoreCaseAndAdmissionDateAndIdNot(
                                                claim.getPolicyNumber(), claim.getClaimantName(),
                                                claim.getHospitalName(),
                                                claim.getAdmissionDate(), claim.getId());
                checks.add(new DataGuardCheck(
                                "Duplicate Claim Screening",
                                SOURCE,
                                claim.getClaimNumber(),
                                "No other claim with the same policy, claimant, hospital, and admission date",
                                duplicate ? DataGuardSeverity.WARNING : DataGuardSeverity.VALID,
                                duplicate ? "Warning" : "Valid",
                                duplicate ? "A claim with the same identifying details already exists."
                                                : "No matching claim was found.",
                                duplicate ? "Review the existing claim before processing this record."
                                                : "No action required."));
                return checks;
        }

        private static void required(List<DataGuardCheck> checks, String field, String value) {
                boolean missing = value == null || value.isBlank();
                checks.add(new DataGuardCheck(
                                field, SOURCE, value, "A non-empty value",
                                missing ? DataGuardSeverity.MISSING : DataGuardSeverity.VALID,
                                missing ? "Missing" : "Valid",
                                missing ? field + " is required." : field + " is present.",
                                missing ? "Provide " + field.toLowerCase(java.util.Locale.ROOT) + "."
                                                : "No action required."));
        }

        private static void validateNpi(List<DataGuardCheck> checks, String npi) {
                if (npi == null || npi.isBlank()) {
                        checks.add(new DataGuardCheck("Hospital NPI", SOURCE, npi,
                                        "10-digit NPI with valid check digit",
                                        DataGuardSeverity.MISSING, "Missing", "Hospital NPI is required.",
                                        "Provide the facility's 10-digit NPI."));
                        return;
                }
                boolean valid = isValidNpi(npi);
                checks.add(new DataGuardCheck(
                                "Hospital NPI", SOURCE, npi, "10-digit NPI with valid check digit",
                                valid ? DataGuardSeverity.VALID : DataGuardSeverity.INVALID,
                                valid ? "Valid" : "Invalid",
                                valid ? "NPI format and check digit are valid."
                                                : "NPI must contain 10 digits and pass the NPI Luhn check.",
                                valid ? "No action required." : "Verify the facility NPI."));
        }

        public static boolean isValidNpi(String npi) {
                if (npi == null || !npi.matches("\\d{10}")) {
                        return false;
                }
                String digits = "80840" + npi;
                int sum = 0;
                boolean doubleDigit = false;
                for (int index = digits.length() - 1; index >= 0; index--) {
                        int digit = digits.charAt(index) - '0';
                        if (doubleDigit) {
                                digit *= 2;
                                if (digit > 9) {
                                        digit -= 9;
                                }
                        }
                        sum += digit;
                        doubleDigit = !doubleDigit;
                }
                return sum % 10 == 0;
        }

        private static void validateDateRange(List<DataGuardCheck> checks, LocalDate admission, LocalDate discharge) {
                boolean missing = admission == null || discharge == null;
                boolean inconsistent = !missing && discharge.isBefore(admission);
                DataGuardSeverity severity = missing ? DataGuardSeverity.MISSING
                                : inconsistent ? DataGuardSeverity.INCONSISTENT : DataGuardSeverity.VALID;
                checks.add(new DataGuardCheck(
                                "Admission and Discharge Dates", SOURCE,
                                admission + " / " + discharge, "Both dates present; discharge is not before admission",
                                severity,
                                missing ? "Missing" : inconsistent ? "Inconsistent" : "Valid",
                                missing ? "Both admission and discharge dates are required for validation."
                                                : inconsistent ? "Discharge date occurs before admission date."
                                                                : "Admission and discharge dates are consistent.",
                                missing || inconsistent ? "Verify both service dates." : "No action required."));
        }

        private static void validateMoney(List<DataGuardCheck> checks, String field,
                        BigDecimal value, BigDecimal maximum) {
                boolean missing = value == null;
                boolean invalid = !missing && value.signum() < 0;
                boolean inconsistent = !missing && maximum != null && value.compareTo(maximum) > 0;
                DataGuardSeverity severity = missing ? DataGuardSeverity.MISSING
                                : invalid ? DataGuardSeverity.INVALID
                                                : inconsistent ? DataGuardSeverity.INCONSISTENT
                                                                : DataGuardSeverity.VALID;
                checks.add(new DataGuardCheck(
                                field, SOURCE, value == null ? null : value.toPlainString(),
                                maximum == null ? "Non-negative amount" : "Between 0 and " + maximum.toPlainString(),
                                severity,
                                missing ? "Missing" : invalid ? "Invalid" : inconsistent ? "Inconsistent" : "Valid",
                                missing ? field + " is missing."
                                                : invalid ? field + " cannot be negative."
                                                                : inconsistent ? field + " exceeds the claim amount."
                                                                                : field + " is within the permitted range.",
                                missing || invalid || inconsistent ? "Verify the amount and currency."
                                                : "No action required."));
        }

        private static void validateCodeSet(List<DataGuardCheck> checks, String field,
                        List<ClaimCode> codes, java.util.regex.Pattern pattern,
                        String expected) {
                if (codes.isEmpty()) {
                        checks.add(new DataGuardCheck(field, SOURCE, null, expected,
                                        DataGuardSeverity.MISSING, "Missing",
                                        "At least one " + field.toLowerCase() + " is required.",
                                        "Add a valid code from the claim record."));
                        return;
                }
                for (ClaimCode code : codes) {
                        String value = code.getCode().toUpperCase(java.util.Locale.ROOT);
                        boolean valid = pattern.matcher(value).matches();
                        checks.add(new DataGuardCheck(
                                        field + " " + value, SOURCE, value, expected,
                                        valid ? DataGuardSeverity.VALID : DataGuardSeverity.INVALID,
                                        valid ? "Valid" : "Invalid",
                                        valid ? "Code matches the expected syntax."
                                                        : "Code does not match the expected " + expected + ".",
                                        valid ? "No action required."
                                                        : "Verify the code against the applicable coding standard."));
                }
        }

        private static int count(List<DataGuardCheck> checks, DataGuardSeverity severity) {
                return (int) checks.stream().filter(check -> check.getSeverity() == severity).count();
        }

        private Claim requireClaim(String claimNumber) {
                return claimRepository.findByClaimNumber(claimNumber)
                                .orElseThrow(() -> new ApiException("Claim not found.", HttpStatus.NOT_FOUND));
        }

        private UserAccount requireUser(String id) {
                return userRepository.findById(id)
                                .orElseThrow(() -> new ApiException("User not found.", HttpStatus.NOT_FOUND));
        }
}
