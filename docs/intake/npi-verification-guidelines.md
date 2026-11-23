# National Provider Identifier (NPI) Checksum Verification

## Luhn Check Algorithm
1. Prefix NPI with `80840` for US health provider identifier
2. Execute standard Luhn modulo-10 algorithm
3. Verify check-digit matches 10th digit of NPI
