package com.claimpilot;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=none")
@ActiveProfiles("mysql")
@TestPropertySource(properties = "claimpilot.jwt.secret=claimpilot-test-only-secret-key-1234567890abcdef")
@EnabledIfEnvironmentVariable(named = "MYSQL_IT_ENABLED", matches = "true")
class MySqlConnectionSmokeTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void connectsToExistingClaimPilotDatabaseWithoutChangingItsSchema() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metadata = connection.getMetaData();
            assertEquals("MySQL", metadata.getDatabaseProductName());
            assertEquals("claimpilot_db", connection.getCatalog());

            try (var statement = connection.createStatement();
                 var result = statement.executeQuery("SELECT DATABASE()")) {
                org.junit.jupiter.api.Assertions.assertEquals(true, result.next());
                assertEquals("claimpilot_db", result.getString(1));
            }
        }
    }
}
