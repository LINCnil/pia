exports.default = async function(configuration) {
  // do not include passwords or other sensitive data in the file
  // rather create environment variables with sensitive data
  const CERT_KEY_ID = process.env.CERT_KEY_ID;
  const CERT_PIN = process.env.CERT_PIN;
  const CERT_PASS = process.env.CERT_PASS;

  require("child_process").execSync(
    `osslsigncode sign -verbose -pkcs11engine /usr/lib/x86_64-linux-gnu/engines-1.1/pkcs11.so -pkcs11module /lib/libeToken.so -h sha256 -n app-name -t https://timestamp.verisign.com/scripts/timestamp.dll -certs  ${CERT_KEY_ID} -key '${CERT_PIN}' -pass '${CERT_PASS}' -in /releases/pia-Setup-3.0.0.exe -out /releases/pia-Setup-3.0.0.signed.exe`,
    {
      stdio: "inherit"
    }
  );
};
