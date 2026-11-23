package com.claimpilot.service;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class ClaimCopayValidator {

    public boolean isValidCopay(BigDecimal claimAmount, BigDecimal copayAmount) {
        if (claimAmount == null || copayAmount == null) return false;
        if (copayAmount.signum() < 0) return false;
        return copayAmount.compareTo(claimAmount) <= 0;
    }
}
