// src/utils/alertUtils.js

export const showAlert = (setAlert, message, type = "info") => {
    setAlert({ visible: true, message, type });
    setTimeout(
      () => setAlert({ visible: false, message: "", type: "info" }),
      3000
    );
  };
  