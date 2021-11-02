require("dotenv").config();
exports.default = async function(configuration) {
  // work based on https://www.electron.build/tutorials/code-signing-windows-apps-on-unix#signing-windows-app-on-maclinux-using-jsign
  const CERT_KEY_ID = process.env.CERT_KEY_ID;
  const CERT_PIN = process.env.CERT_PIN;
  const CERT_PASS = process.env.CERT_PASS;
  const LIB_TOKEN_SO = process.env.LIB_TOKEN_SO;

  require("child_process").execSync(
    `osslsigncode sign -verbose -pkcs11engine /usr/lib/x86_64-linux-gnu/engines-1.1/pkcs11.so -pkcs11module ${LIB_TOKEN_SO} -h sha256 -n app-name -t https://timestamp.verisign.com/scripts/timestamp.dll -certs  ${CERT_KEY_ID} -key '${CERT_PIN}' -pass '${CERT_PASS}' -in /releases/pia-Setup-3.0.0.exe -out /releases/pia-Setup-3.0.0.signed.exe`,
    {
      stdio: "inherit"
    }
  );
};
