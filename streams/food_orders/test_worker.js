const { parentPort, workerData } = require("worker_threads");

const orderId = workerData.orderId;

// Simulate order processing
function processOrder(orderId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        orderId,
        status: "Processing order",
        timestamp: new Date().toISOString(),
      });
    }, 1000);
  });
}

// Simulate route optimization
function optimizeRoute(orderId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        orderId,
        status: "Optimizing delivery route",
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  });
}

// Simulate delivery time estimation
function estimateDelivery(orderId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        orderId,
        status: "Estimating delivery time",
        timestamp: new Date().toISOString(),
      });
    }, 3000);
  });
}

async function handleOrder(orderId) {
  try {
    console.log(orderId);
    const orderStatus = await processOrder(orderId);
    parentPort.postMessage(orderStatus);

    const routeStatus = await optimizeRoute(orderId);
    parentPort.postMessage(routeStatus);

    const deliveryStatus = await estimateDelivery(orderId);
    parentPort.postMessage(deliveryStatus);

    parentPort.close();
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
}

handleOrder(orderId);
