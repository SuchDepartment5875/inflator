import { AwsRum } from "aws-rum-web";

export const beginAwsRumMonitoring = () => {
  try {
    const config = {
      sessionSampleRate: 1,
      guestRoleArn: process.env.REACT_APP_AWS_RUM_GUEST_ROLE_ARN || "unknown",
      identityPoolId:
        process.env.REACT_APP_AWS_RUM_IDENTITY_POOL_ID || "unknown",
      endpoint: "https://dataplane.rum.eu-west-1.amazonaws.com",
      telemetries: ["performance", "errors", "http"],
      allowCookies: false,
      enableXRay: false,
    };

    const APPLICATION_ID = process.env.REACT_APP_AWS_RUM_ID || "unknown";
    const APPLICATION_VERSION = "1.0.0";
    const APPLICATION_REGION = "eu-west-1";

    new AwsRum(APPLICATION_ID, APPLICATION_VERSION, APPLICATION_REGION, config);
  } catch (error) {
    console.error(error);
    // Ignore errors thrown during CloudWatch RUM web client initialization
  }
};
