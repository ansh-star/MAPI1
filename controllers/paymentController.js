const crypto = require("crypto");
const axios = require("axios");

let salt_key = "96434309-7796-489d-8924-ab56988a6076";
let merchant_id = "PGTESTPAYUAT86";

const makePayment = async (req, res) => {
  try {
    // Extract the fields from the request body
    const { transactionId, amount, phone, orderId } = req.body;

    // Data to be sent in the payload
    const data = {
      merchantId: merchant_id,
      merchantTransactionId: transactionId, // Use transactionId from the body
      name: orderId, // Use orderId as the name
      amount: amount * 100, // Convert amount to the smallest currency unit
      redirectUrl: `http://localhost:8000/status?id=${transactionId}`, // Redirect URL with transactionId
      redirectMode: "POST",
      mobileNumber: phone, // Use phone from the body
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Generate the payload and checksum
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    // PhonePe Sandbox URL
    const prod_URL =
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

    // Set up Axios options
    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum, // Add checksum to headers
      },
      data: {
        request: payloadMain, // Add base64 payload
      },
    };

    // Make the API request
    const response = await axios(options);

    // Check the response and send a formatted response back
    if (response.data.success) {
      return res.json({
        success: true,
        message: "Payment request processed successfully.",
        data: response.data,
      });
    } else {
      return res.json({
        success: false,
        message: "Payment request failed.",
        data: response.data,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const paymentStatus = async (req, res) => {
  const merchantTransactionId = req.query.id;
  const merchantId = merchant_id;

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  axios
    .request(options)
    .then(function (response) {
      if (response.data.success === true) {
        const url = "http://localhost:5173/success";
        return res.redirect(url);
      } else {
        const url = "http://localhost:5173/fail";
        return res.redirect(url);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
};

module.exports = { makePayment, paymentStatus };
