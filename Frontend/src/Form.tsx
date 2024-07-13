import React, { useState, useEffect, useRef } from "react";
import "./Form.css";
import mySqlIcon from "./icons/mysql.svg";

interface NewFormProps {
  onCancel: () => void;
  recentForm: boolean;
}

const NewForm: React.FC<NewFormProps> = ({ onCancel, recentForm }) => {
  const [name, setName] = useState<string>("");
  const [host, setHost] = useState<string>("");
  const [port, setPort] = useState<string>("");
  const [databaseName, setDatabaseName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [jdbcString, setJdbcString] = useState<string>("");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(true);
  const [connectionType, setConnectionType] = useState<string>("details");
  const [databaseType, setDatabaseType] = useState<string>("MySQL");
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const initialFormValues = useRef({
    name: "",
    host: "",
    port: "",
    databaseName: "",
    username: "",
    password: "",
    jdbcString: "",
  });

  useEffect(() => {
    const checkFormValidity = () => {
      if (
        name &&
        host &&
        port &&
        databaseName &&
        username &&
        databaseType &&
        isValidPassword(password)
      ) {
        setIsFormValid(true);
      } else {
        setIsFormValid(false);
      }
    };

    checkFormValidity();
  }, [name, host, port, databaseName, username, password, databaseType]);

  useEffect(() => {
    if (recentForm) {
      const savedFormData = localStorage.getItem("recentFormData");
      if (savedFormData) {
        const formData = JSON.parse(savedFormData);
        setName(formData.name);
        setHost(formData.host);
        setPort(formData.port);
        setDatabaseName(formData.databaseName);
        setUsername(formData.username);
        setPassword(formData.password);
        setJdbcString(formData.jdbcString);
        initialFormValues.current = formData;
      }
    }
  }, [recentForm]);

  useEffect(() => {
    const hasChanges =
      name !== initialFormValues.current.name ||
      host !== initialFormValues.current.host ||
      port !== initialFormValues.current.port ||
      databaseName !== initialFormValues.current.databaseName ||
      username !== initialFormValues.current.username ||
      password !== initialFormValues.current.password ||
      jdbcString !== initialFormValues.current.jdbcString;

    setIsSaveDisabled(!hasChanges);
  }, [name, host, port, databaseName, username, password, jdbcString]);

  const handleSave = () => {
    if (isFormValid || jdbcString.trim() !== "") {
      const formData = {
        name,
        host,
        port,
        databaseName,
        username,
        password,
        jdbcString,
        databaseType,
      };
      localStorage.setItem("recentFormData", JSON.stringify(formData));
      initialFormValues.current = formData;
      console.log("Form data saved successfully");
    } else {
      setTouched({
        name: true,
        host: true,
        port: true,
        databaseName: true,
        username: true,
        password: true,
        jdbcString: true,
        databaseType: true,
      });
    }
  };

  const handleTestConnection = async () => {
    if (isFormValid || jdbcString.trim() !== "") {
      const formData = {
        name,
        host,
        port,
        databaseName,
        username,
        password,
        jdbcString,
        databaseType,
      };

      try {
        const response = await fetch("http://localhost:8081/hello", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setConnectionStatus("Connected to the database!");
          console.log("Form data sent successfully");
          initialFormValues.current = formData;
        } else {
          setConnectionStatus("Failed to connect to the database!");
          console.error("Failed to send form data");
        }
      } catch (error) {
        setConnectionStatus("Error connecting to the database!");
        console.error("Error sending form data:", error);
      }
    } else {
      setTouched({
        name: true,
        host: true,
        port: true,
        databaseName: true,
        username: true,
        password: true,
        jdbcString: true,
        databaseType: true,
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const isValidPassword = (password: string) => {
    const regex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const getValidationMessage = (field: string) => {
    if (field === "password") {
      if (touched[field] && !isValidPassword(password)) {
        return "Password must be at least 8 characters long, contain alphanumeric characters, and special characters.";
      }
    }
    if (
      field === "name" ||
      field === "host" ||
      field === "port" ||
      field === "databaseName" ||
      field === "username" ||
      field === "jdbcString" ||
      field === "databaseType"
    ) {
      if (touched[field] && !eval(field)) {
        return "Field is required!";
      }
    }
    return "";
  };

  return (
    <div className="form-container">
      <form className="form-box">
        <div className="header">
          <h1>Database Connection</h1>
        </div>

        <div className="text1">
          <p>
            Connect directly to an external database, then query it to get the
            data you need.
          </p>
          <a
            href="https://docs.mendix.com/appstore/modules/external-database-connector/"
            target="_blank"
          >
            Learn More
          </a>
        </div>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => handleBlur("name")}
            required
          />
          <span className="error-message">{getValidationMessage("name")}</span>
        </div>

        <div className="form-group">
          <label>Database Type</label>
          <div className="database-icons">
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAApCAMAAAB0iUvHAAABhlBMVEUAAAC3HBzP2Ny3GxvP2NvP2N3P2NzP2Ny3HBzO19vQ1NjP2Ny4HBy3GxvO2Ny2Gxu3GxvP2NzO19y3HBy3HBy3Gxu3Gxu3GxvN1dnO2t23GhrP2dzP2NzP2NzP2N22HBzO2d3P2N22Gxu6HBzM2Nu/IyO3HBy3HBy4Gxu4HBzP2dy3GxvP2dzP2Ny3GxvP2NzP2Ny2GxvP19zP2NzO2Ny2Gxu2HBzQ2d3O2d7L2Nje3t63HBzQ2NzP2t62HBzO2Ny4GxvP2Ny2Gxu2HBzP1NjO19y3HBy3HBzQ2NzO2NzO2Ny4HR3N2Nq4Gxu3HBzO2N62Fxe1HBzJ0dnP19zDdXe6MzPP2N23HBy2HBzP2N23Gxu3HBy3Gxu3HBy3GhrO19vP2Ny2HR25HBzM1tnR1du2FRW2tra4JCS9SUm5KSnP2Nu4JCTO19vFi4/CdXe+VVbMvcHEh4rCaGnIpafMx8rKsbLP2N3CfH7MvsK5OTnP2dvN2NvP19rHj4+5Ghq8NzfP2Ny3HBxW+sulAAAAgHRSTlMAIMzfYN6/f9lAD+/Qzaidl5Fx5cq/sWsrIRnc0qOYWkZBQCIfCPTv69vW1c/Hx8OwkIl8ZV9MPTkTBffZyMi3trWoo6GPhX53dGpPTC4nHBUPC/Xz87u5ioJ5dmZkVlVQRjYxJxEH9/Pv4+Ph4d/Z1dXV0bOzioKBdWtbWiAdF1tD5qUAAAIuSURBVDjL1dPFchtRFEXR08woRovRYrTMbMfsmJnDzCz/efIB6u6MUpU9XvUGr+7BP0qM3fyVS5kVkn0A5wS2ZG6AnneWh8N9koyaZsRR/nqDen0kviRJcIzX2q+XU1VjT3CkSZfXs/v4le/TBzi2rhDpNTc16pGVmaPElq0d2g8Wj9LKLZLlUXmi7CNs7FS2BmiJxfxZeQ3rPn7WGrcVr+x1Zxe2kgrS7dliLlPbtKBpHtDv8zVC12ZcB4ngBHEsr1tYF2qzebQy955LANopQPCng6nsXmzpK8XMVD4JnHgBIEitDKSUh6By2rEXhJJIKgSClz6tnL0dIDf5hQy1FpQJgJCpmSnXhH6yEsSgfB4XxV95htLtA7dbb/2EZZuUa5RIZHkvpb/Ygm26xg+19nd33gkgR2zloruYe7JwdRgT1EK4Y3sB97lnL+fi2OsCXP+7raTOvs3fhHsMUqy6bLMw36MdP0oBmNNhrhAHbVrKL29/hLGqAuKfhd0BTctXP7/fRkVkAhtcSLqIMNON6qqFPK8A4IZDbKXpZwAsSX2rgTEcvayG+pENIErjepLtsBb/2hn72KAvxuIhbjtV6KolAeIwBnetAr3Jr9hukKTECgBiEQvaKwVgcICfk5gwa8YCvblVWNQljRAdJVnjaQB+ek7qP4dlfqZvxESRpCF25snpiAGb6EKVHmeM8bFoUwQTgG3dxvjDh9Fm3J9aqsOxO+Gcq6uT1RH83/0GdQFS7gJjXxUAAAAASUVORK5CYII="
              alt="Microsoft SQL"
              className={databaseType === "Microsoft SQL" ? "selected" : ""}
              onClick={() => setDatabaseType("Microsoft SQL")}
            />

            <img
              src={mySqlIcon}
              alt="MySQL"
              className={databaseType === "MySQL" ? "selected" : ""}
              onClick={() => setDatabaseType("MySQL")}
            />
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAoCAMAAABQF/NcAAABg1BMVEUAAADrGyPuGiTtGiPtGiPrGyTtGiTtGyTtGiTvICDrGiTqHCXtGyTsGyPqGyTqECDuHCTsGyTuGyTtHCTtGiTtGyTpGSPvICXqFSXtGyT////mc3roMzzvNz/7xsjwv8LjmaHvZWrrJzD84+TwiY7pTlbnUVTdRlDz9/nnuL7qn6T1jZHshozdYWrlWWLyVFvoV1jpQUnsNTvlMDrjLjnlIizhICv2+fv98PHz6Ov64OLxzdDpur/4qq3uo6jinqbkm6LRjpjzfYPadX/sdHnyb3Xrb3HiZ2/sbW7sYGftWV7tUljmSlHrREjtMTjdLDfhLjXmHCbrHSXrFx/q8PTi6/Dw5+ry5ujn4eb13eD23d/w2t3o1Nnl0df40tT2wsbgs7rusLXorLLXnabxl5vulZrmj5bgi5Pgi5LpjI3ogorng4nuhofceoTTbXjld3fcbXfqanHrTFHsS1DvSk/WQUzvQEbmPUbjPUbcOEPtPELTMDzuNDvTKTfmJS7oFx/oAAHDvj6VAAAAGXRSTlMAIN+Q4EBgwKAQgDDvUGAQ77DPgH9wUDAw8hTHdwAAAeJJREFUOMu9lNVy40AQRdcW2F5DsrytrLSSmSmOw8xMy8zMEKZPj1zRTI9qJvJbzlM/nLp1PW31pQvDp15uEb3dTgxLfiDIQcXDVALgRo6dY3ZIwBP0CXv6QYSsCJo6Ks/19qmI2l5Fwi43CF7IHYwaAxc9+4fgQmJcpsH/D4NZzebZcEnYIoaJb3pfddWOYCNTHkk80QXBuK5crkHnZrK/m8wR0jgEhIa2Cgwvpuh403GjQLijmYDMal24a8eVGPd5wlzsAZvtCaPvMboyrYsulIb7tez9e1rvy4n4XXQjjiuzrs1qqpLaBfheY1zw8W6hCYR4+YG3q5tmufVSa5mi+atNLkCjUvw4Pp78rad0gXuFcXeAMqkPoBsRvNn7/BKZv7x+iu5VwS6ge3Jk9G1+bGw0mQGmg0R2HKE/PatDi/V1APiUGZinbtRxmcKFxDSdK8Ygnf14F4AynXiYS/4ozX7NP+orNEV/9gAgqeKQYRhD7+bj4HoxDPbmGqr4bBzYlvviaun0QnplKb6YXoat6trGmeoTHoi5k+rMlPXz88zm3Oa3av0s4Jb48NStvysHy8f1P9aC9c/aA5tORXD7uHuCBXhUP69KIU4j0Z1uM+B12UNqAMUbXCaHoqg2YV48BWXshPLBRtGaAAAAAElFTkSuQmCC"
              alt="Oracle"
              className={databaseType === "Oracle" ? "selected" : ""}
              onClick={() => setDatabaseType("Oracle")}
            />
            <img
              src="data:image/png;base64,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"
              alt="PostgreSQL"
              className={databaseType === "PostgreSQL" ? "selected" : ""}
              onClick={() => setDatabaseType("PostgreSQL")}
            />
            <img
              // src="data:image/png;base64,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"
              alt="Snowflake"
              className={databaseType === "Snowflake" ? "selected" : ""}
              onClick={() => setDatabaseType("Snowflake")}
            />
          </div>
        </div>

        <hr className="horizontal-line" />

        <div className="radio-buttons">
          <label>
            <input
              type="radio"
              name="connectionType"
              value="details"
              checked={connectionType === "details"}
              onChange={() => setConnectionType("details")}
              className="custom-radio"
            />
            Use connection details
          </label>
          <label>
            <input
              type="radio"
              name="connectionType"
              value="string"
              checked={connectionType === "string"}
              onChange={() => setConnectionType("string")}
              className="custom-radio"
            />
            Use connection string
          </label>
        </div>

        {connectionType === "details" && (
          <>
            <div className="form-group">
              <label htmlFor="host">Host</label>
              <input
                type="text"
                id="host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                onBlur={() => handleBlur("host")}
                required
              />
              <span className="error-message">
                {getValidationMessage("host")}
              </span>
            </div>
            <div className="form-group">
              <label htmlFor="port">Port</label>
              <input
                type="text"
                id="port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                onBlur={() => handleBlur("port")}
                required
              />
              <span className="error-message">
                {getValidationMessage("port")}
              </span>
            </div>
            <div className="form-group">
              <label htmlFor="databaseName">Database Name</label>
              <input
                type="text"
                id="databaseName"
                value={databaseName}
                onChange={(e) => setDatabaseName(e.target.value)}
                onBlur={() => handleBlur("databaseName")}
                required
              />
              <span className="error-message">
                {getValidationMessage("databaseName")}
              </span>
            </div>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleBlur("username")}
                required
              />
              <span className="error-message">
                {getValidationMessage("username")}
              </span>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                required
              />
              <span className="error-message">
                {getValidationMessage("password")}
              </span>
            </div>
          </>
        )}
        {connectionType === "string" && (
          <>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => handleBlur("username")}
                required
              />
              <span className="error-message">
                {getValidationMessage("username")}
              </span>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                required
              />
              <span className="error-message">
                {getValidationMessage("password")}
              </span>
            </div>
            <div className="form-group form-group1">
              <p>JDBC Connection String</p>
              {databaseType === "Oracle" && (
                <>
                  <label htmlFor="jdbcstring">
                    Oracle connection string format:
                  </label>
                  <p>
                    jdbc:oracle:thin:@//myHostName:myPortName/myDatabaseName[?property1=value1&property2=value2&...]
                  </p>
                </>
              )}
              {databaseType === "Microsoft SQL" && (
                <>
                  <label htmlFor="jdbcstring">
                    MSSQL connection string format:
                  </label>
                  <p>
                    jdbc:sqlserver://myHostName:myPortNumber;databasename=myDatabaseName[;property1=value1;property2=value2;...]
                  </p>
                </>
              )}
              {databaseType === "MySQL" && (
                <>
                  <label htmlFor="jdbcstring">
                    MySQL connection string format:
                  </label>
                  <p>
                    jdbc:mysql://myHostName:myPortNumber/myDatabaseName[?property1=value1&property2=value2&...]
                  </p>
                </>
              )}
              {databaseType === "PostgreSQL" && (
                <>
                  <label htmlFor="jdbcstring">
                    PostgreSQL connection string format:
                  </label>
                  <p>
                    jdbc:postgresql://myHostName:myPortNumber/myDatabaseName[?property1=value1&property2=value2&...]
                  </p>
                </>
              )}
              {databaseType === "Snowflake" && (
                <>
                  <label htmlFor="jdbcstring">
                    Snowflake connection string format:
                  </label>
                  <p>
                    jdbc:snowflake://my_account_identifier.snowflakecomputing.com/?db=myDatabaseName[&property1=value1&...]
                  </p>
                </>
              )}
              <input
                type="text"
                id="jdbcstring"
                value={jdbcString}
                onChange={(e) => setJdbcString(e.target.value)}
                onBlur={() => handleBlur("jdbcstring")}
                required
              />
              <span className="error-message">
                {getValidationMessage("jdbcstring")}
              </span>
            </div>
          </>
        )}

        <div className="text">
          <p>
            Avoid exposing your credentials, and remove the DB connection
            details constant values before commit to your version control/team
            server. The connection details are stored in 3 constants:
            DBUsername, DBPassword and DBSource.
          </p>
        </div>

        {connectionStatus && (
          <div
            className={`connection-status ${
              connectionStatus === "Connected to the database!"
                ? "connected"
                : "failed"
            }`}
          >
            <p>{connectionStatus}</p>
          </div>
        )}

        <hr className="horizontal-line2" />

        <div className="form-buttons">
          <button type="button" onClick={handleTestConnection}>
            Test Connection
          </button>
          <div className="save">
            <button
              type="button"
              onClick={handleSave}
              className={isSaveDisabled ? "disabled" : ""}
              disabled={isSaveDisabled}
            >
              Save
            </button>
          </div>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewForm;
