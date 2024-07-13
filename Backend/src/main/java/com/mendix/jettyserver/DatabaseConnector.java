package com.mendix.jettyserver;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class DatabaseConnector {

    private String name, host, port, databaseName, username, password, jdbcString, databaseType;

    public static void handlePostRequest(BufferedReader reader) throws IOException {
        StringBuilder jsonRequest = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            jsonRequest.append(line);
        }

        System.out.println("Received JSON data:");
        System.out.println(jsonRequest.toString());

        JsonObject jsonObject = JsonParser.parseString(jsonRequest.toString()).getAsJsonObject();
        DatabaseConnector connectionDetails = new DatabaseConnector(jsonObject);

        System.out.println("Received details: " + jsonObject.toString());

        if (connectionDetails.jdbcString == null || connectionDetails.jdbcString.isEmpty()) {
            connectionDetails.buildJdbcString();
        }
        System.out.println("Built JDBC string: " + connectionDetails.jdbcString);

        try (Connection connection = DriverManager.getConnection(connectionDetails.jdbcString, connectionDetails.username, connectionDetails.password)) {
            System.out.println(connection != null ? "Connected to the database!" : "Failed to make connection!");
        } catch (SQLException e) {
            System.out.println("SQL Exception: " + e.getMessage());
        }
    }

    public DatabaseConnector(JsonObject jsonObject) {
        Map<String, String> details = Stream.of("name", "host", "port", "databaseName", "username", "password", "jdbcString", "databaseType")
                .collect(Collectors.toMap(key -> key, key -> jsonObject.has(key) ? jsonObject.get(key).getAsString() : ""));

        this.name = details.get("name");
        this.host = details.get("host");
        this.port = details.get("port");
        this.databaseName = details.get("databaseName");
        this.username = details.get("username");
        this.password = details.get("password");
        this.jdbcString = details.get("jdbcString");
        this.databaseType = details.get("databaseType");
    }

    private void buildJdbcString() {
        if (!host.isEmpty() && !port.isEmpty() && !databaseName.isEmpty()) {
            switch (databaseType.toLowerCase()) {
                case "oracle":
                    this.jdbcString = String.format("jdbc:oracle:thin:@//%s:%s/%s", host, port, databaseName);
                    break;
                case "mysql":
                    this.jdbcString = String.format("jdbc:mysql://%s:%s/%s?user=%s&password=%s", host, port, databaseName, username, password);
                    break;
                case "postgresql":
                    this.jdbcString = String.format("jdbc:postgresql://%s:%s/%s", host, port, databaseName);
                    break;
                case "sqlserver":
                    this.jdbcString = String.format("jdbc:sqlserver://%s:%s;databaseName=%s", host, port, databaseName);
                    break;
                case "snowflake":
                    this.jdbcString = String.format("jdbc:snowflake://%s.snowflakecomputing.com/?db=%s", host, databaseName);
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported database type: " + databaseType);
            }
        } else {
            throw new IllegalArgumentException("Insufficient details to build JDBC connection string.");
        }
    }
}



