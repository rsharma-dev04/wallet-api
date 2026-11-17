
import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    const { success } = await ratelimit.limit(
      req.ip || "unknown"
    );

    if (!success) {
      return res.status(429).json({
        message: "Too many requests, please try again later.",
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);

    return res.status(503).json({
      message: "Rate limiter unavailable",
    });
  }
};

export default rateLimiter;
    