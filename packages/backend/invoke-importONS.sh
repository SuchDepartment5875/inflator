echo "circlecienvvar=" ${CIRCLECI}

if [[ -z "${CIRCLECI}" ]]; then
  # if local, use a profile for the correct environment
  echo "Invoking importONSData handler using AWS profile" james-${ENVIRONMENT}
  sls invoke -f importONSData --aws-profile james-${ENVIRONMENT}
else
  # if on CI, use default AWS credentials
  echo "Invoking importONSData handler using the default AWS profile"
  sls invoke -f importONSData
fi
