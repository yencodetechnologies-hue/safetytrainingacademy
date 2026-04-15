const rapid = require('eway-rapid');
const Payment = require('../models/Payment');

// Create client
const client = rapid.createClient(
  process.env.EWAY_API_KEY,
  process.env.EWAY_API_PASSWORD,
  'sandbox'
);

exports.createPayment = async (req, res) => {
  try {
    const {
      amount, email, name, phone,
      cardName, cardNumber, expiryMonth, expiryYear, cvv,
      currency = 'AUD', userId, description
    } = req.body;

    console.log('📥 Payment request received:', { amount, email, name });

    const payment = new Payment({
      transactionId: `eway_${Date.now()}`,
      userId: userId || phone,
      amount,
      currency,
      paymentMethod: 'eway',
      description: description || `Payment by ${name} - ${email}`,
      status: 'pending'
    });
    await payment.save();

    // ✅ Use the exact format from eWAY documentation
    const requestData = {
  Customer: {
    Reference: name,
    Email: email,
    FirstName: name,
    LastName: name,
    Phone: phone,
    CardDetails: {
      Name: cardName,
      Number: cardNumber.replace(/\s/g, ''),
      ExpiryMonth: expiryMonth,
      ExpiryYear: expiryYear.slice(-2),
      CVN: cvv
    }
  },
  Payment: {
    TotalAmount: Math.round(parseFloat(amount) * 100),
    CurrencyCode: currency
  },
  TransactionType: 'Purchase'
};

    console.log('📤 Sending to eWAY');
    
    // ✅ Use DirectPayment method instead of createTransaction
   client.createTransaction(requestData, async (error, response) => {
  try {
    if (error) {
      console.error("❌ eWAY Error:", error);
      payment.status = "failed";
      await payment.save();

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    console.log("✅ Response received:", response);

    if (response.Errors) {
      console.error("❌ Errors:", response.Errors);
      payment.status = "failed";
      await payment.save();

      return res.status(400).json({
        success: false,
        message: response.Errors
      });
    }

    const isApproved = response.TransactionStatus;

    payment.gatewayTransactionId = String(response.TransactionID || "");
    payment.status = isApproved ? "completed" : "failed";
    payment.authorizationCode = response.AuthorisationCode || "";
    await payment.save();

    return res.json({
      success: isApproved,
      transactionId: payment.transactionId,
      status: payment.status,
      message: isApproved ? "Payment successful" : "Payment declined"
    });

  } catch (err) {
    console.error("❌ Callback error:", err);
    res.status(500).json({ success: false, message: "Processing error" });
  }
});

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// 2. CREATE PAYMENT WITH TOKEN (Saved Card)
// ============================================
exports.createPaymentWithToken = async (req, res) => {
  try {
    const { amount, currency = 'AUD', userId, description, paymentToken } = req.body;

    const payment = new Payment({
      transactionId: `eway_${Date.now()}`,
      userId,
      amount,
      currency,
      paymentMethod: 'eway',
      description,
      status: 'pending'
    });

    await payment.save();

    const transaction = {
      Customer: { TokenCustomerID: paymentToken },
      Payment: {
        TotalAmount: Math.round(amount * 100),
        CurrencyCode: currency,
        InvoiceDescription: description
      },
      Method: 'TokenPayment',
      TransactionType: 'Purchase'
    };

    // ✅ FIXED (NO CALLBACK)
    const response = await client.createTransaction(transaction);

    if (response.Errors) {
      payment.status = 'failed';
      await payment.save();

      return res.status(400).json({
        success: false,
        transactionId: payment.transactionId,
        message: response.Errors
      });
    }

    const isApproved = response.TransactionStatus;

    payment.gatewayTransactionId = String(response.TransactionID);
    payment.status = isApproved ? 'completed' : 'failed';
    payment.authorizationCode = response.AuthorisationCode;

    await payment.save();

    return res.json({
      success: isApproved,
      transactionId: payment.transactionId,
      status: payment.status,
      message: isApproved ? 'Payment successful' : 'Payment declined'
    });

  } catch (error) {
    console.error("🔥 Token Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 3. CREATE PAYMENT TOKEN (Save Card)
// ============================================
exports.createPaymentToken = async (req, res) => {
  try {
    const { cardNumber, cardExpiryMonth, cardExpiryYear, cvv, cardHolderName } = req.body;

    const transaction = {
      Customer: {
        CardDetails: {
          Name: cardHolderName,
          Number: cardNumber,
          ExpiryMonth: cardExpiryMonth,
          ExpiryYear: cardExpiryYear,
          CVN: cvv
        }
      },
      Method: 'CreateTokenCustomer',
      TransactionType: 'Purchase'
    };

    // ✅ FIXED (NO CALLBACK)
    const response = await client.createTransaction(transaction);

    if (response.Errors) {
      return res.status(400).json({
        success: false,
        error: response.Errors
      });
    }

    return res.json({
      success: true,
      paymentToken: response.Customer?.TokenCustomerID,
      cardType: response.CardType || '',
      maskedCardNumber: response.Customer?.CardDetails?.Number || ''
    });

  } catch (error) {
    console.error("🔥 Token Creation Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// 4. REFUND PAYMENT
// ============================================
exports.refundPayment = async (req, res) => {
  try {
    const { transactionId, refundAmount } = req.body;
    const payment = await Payment.findOne({ transactionId });

    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'completed') return res.status(400).json({ error: 'Cannot refund non-completed payment' });

    const transaction = {
      Refund: {
        TotalAmount: Math.round((refundAmount || payment.amount) * 100),
        TransactionID: payment.gatewayTransactionId
      }
    };

    client.run('Refund', transaction, async (response) => {
      if (response.get('Errors')) {
        return res.status(400).json({ success: false, error: response.get('Errors') });
      }

      const isApproved = response.get('TransactionStatus');
      if (isApproved) {
        payment.status = 'refunded';
        payment.updatedAt = new Date();
        await payment.save();

        return res.json({
          success: true,
          transactionId: payment.transactionId,
          refundTransactionId: String(response.get('TransactionID')),
          refundAmount: refundAmount || payment.amount
        });
      } else {
        return res.status(400).json({ success: false, error: response.get('ResponseMessage') });
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// 5. GET PAYMENT DETAILS
// ============================================
exports.getPaymentDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const payment = await Payment.findOne({ transactionId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// 6. GET PAYMENT HISTORY
// ============================================
exports.getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};