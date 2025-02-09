const crypto = require("crypto");
const axios = require("axios");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const { saveAndPushNotification } = require("./notificationController");

let salt_key = "96434309-7796-489d-8924-ab56988a6076";
let merchant_id = "PGTESTPAYUAT86";

const convertAmount = (amount) => {
  const amountStr = amount.toString();

  if (!amountStr.includes(".")) {
    return Math.round(amount * 100); // Whole number case (e.g., 4 → 400)
  }

  const decimalPlaces = amountStr.split(".")[1].length;

  if (decimalPlaces === 2) {
    return Math.round(amount * 100); // 3 decimal places → multiply by 1000
  }else if (decimalPlaces===1){
    return Math.round(amount*100);
  } 
};

const makePayment = async (req, res) => {
  try {
    const { amount, phone, orderId } = req.body;
    const convertedAmount=convertAmount(amount);

    const data = {
      merchantId: merchant_id,
      merchantTransactionId: orderId,
      name: orderId,
      amount: convertedAmount,
      redirectUrl: `http://localhost:8000/status?id=${orderId}`,
      redirectMode: "POST",
      mobileNumber: phone,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const prod_URL =
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    const response = await axios(options);

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
  const orderId = req.query.id; // Extract orderId from the request body
  const { id } = req.user;
  const merchantId = merchant_id;
  const keyIndex = 1;
  const string = `/pg/v1/status/${merchantId}/${orderId}` + salt_key;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${orderId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": merchantId,
    },
  };

  try {
    const response = await axios.request(options);
    const paymentStatus = response.data.success ? "SUCCESS" : "FAILURE";
    const transactionId = response.data.data.transactionId;
    const newPayment = new Payment({
      orderId,
      paymentStatus,
      transactionId,
      updatedAt: new Date(),
    });

    await newPayment.save();

    await Order.findOneAndUpdate(
      { _id: orderId },
      {
        order_payment_id: newPayment._id,
        order_payment_status: paymentStatus,
      }
    );

    if (paymentStatus === "SUCCESS") {
      saveAndPushNotification(
        id,
        "Payment Successful",
        `Payment for order #${orderId} has been successful`
      );
    } else {
      saveAndPushNotification(
        id,
        "Payment Failed",
        `Payment for order #${orderId} has failed`
      );
    }
    const redirectUrl = response.data.success
      ? "http://localhost:5173/success"
      : "http://localhost:5173/fail";

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { makePayment, paymentStatus };
