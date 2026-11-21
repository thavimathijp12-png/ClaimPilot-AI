package com.claimpilot.service;

import com.claimpilot.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class DocumentStorageService {

    private final Path storageRoot;

    public DocumentStorageService(
            @Value("${claimpilot.documents.storage-directory:./data/documents}") String storageDirectory) {
        this.storageRoot = Path.of(storageDirectory).toAbsolutePath().normalize();
    }

    public StoredFile store(byte[] bytes) throws IOException {
        FileType fileType = detectType(bytes);
        Files.createDirectories(storageRoot);
        String storageKey = UUID.randomUUID() + "." + fileType.extension();
        Path destination = resolve(storageKey);
        Path temporary = resolve(UUID.randomUUID() + ".tmp");
        try {
            Files.write(temporary, bytes);
            try {
                Files.move(temporary, destination, StandardCopyOption.ATOMIC_MOVE);
            } catch (java.nio.file.AtomicMoveNotSupportedException ex) {
                Files.move(temporary, destination);
            }
        } finally {
            Files.deleteIfExists(temporary);
        }

        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(bytes);
            return new StoredFile(storageKey, fileType.contentType(), HexFormat.of().formatHex(digest));
        } catch (NoSuchAlgorithmException ex) {
            Files.deleteIfExists(destination);
            throw new IllegalStateException("SHA-256 is unavailable in this Java runtime.", ex);
        }
    }

    public Path resolve(String storageKey) {
        Path resolved = storageRoot.resolve(storageKey).normalize();
        if (!resolved.startsWith(storageRoot) || storageKey.contains("/") || storageKey.contains("\\")) {
            throw new ApiException("Invalid document storage key.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return resolved;
    }

    public Path requireStoredFile(String storageKey) {
        Path path = resolve(storageKey);
        if (!Files.isRegularFile(path)) {
            throw new ApiException("Document content is unavailable.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return path;
    }

    public void deleteStoredFile(String storageKey) throws IOException {
        Files.deleteIfExists(resolve(storageKey));
    }

    private static FileType detectType(byte[] bytes) {
        if (startsWith(bytes, new byte[]{'%', 'P', 'D', 'F', '-'})) {
            return new FileType("pdf", "application/pdf");
        }
        if (startsWith(bytes, new byte[]{
                (byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A
        })) {
            return new FileType("png", "image/png");
        }
        if (startsWith(bytes, new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})) {
            return new FileType("jpg", "image/jpeg");
        }
        if (startsWith(bytes, new byte[]{'I', 'I', 42, 0})
                || startsWith(bytes, new byte[]{'M', 'M', 0, 42})) {
            return new FileType("tiff", "image/tiff");
        }
        throw new ApiException("Only PDF, PNG, JPEG, or TIFF documents are accepted.", HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    private static boolean startsWith(byte[] bytes, byte[] prefix) {
        if (bytes.length < prefix.length) {
            return false;
        }
        for (int index = 0; index < prefix.length; index++) {
            if (bytes[index] != prefix[index]) {
                return false;
            }
        }
        return true;
    }

    private record FileType(String extension, String contentType) { }

    public record StoredFile(String storageKey, String contentType, String sha256) { }
}
