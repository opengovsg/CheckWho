import { addFormats, Schema } from 'convict'

export interface TwilioCredentials {
  accountSid: string
  apiKeySid: string
  apiKeySecret: string
  senderId: string
}

export interface ConfigSchema {
  frontendUrls: {
    frontendGovtBase: string
  }
  port: number
  environment: 'development' | 'staging' | 'production' | 'test'
  appEnv: 'dev' | 'stg' | 'prod' | 'test'
  isDowntime: boolean
  awsRegion: string
  database: {
    host: string
    username: string
    password: string
    port: number
    name: string
    logging: boolean
    minPool: number
    maxPool: number
  }
  session: { name: string; secret: string; cookie: { maxAge: number } }
  otp: {
    expiryPeriod: number
    numAllowedAttempts: number
  }
  uniqueParams: {
    defaultExpiryPeriod: number
  }
  postman: {
    apiUrl: string
    apiKey: string
  }
  adminKey: {
    length: number
    hash: string
    algo: string
  }
  sgNotify: {
    baseUrl: string
    timeout: number
    eServiceId: string
    clientId: string
    clientSecret: string
    ecPrivateKey: string
  }
  gogovsg: {
    apiUrl: string
    apiKey: string
  }
  twilio: {
    defaultCredentials: TwilioCredentials
    ogpCredentials: TwilioCredentials
    mohCredentials: TwilioCredentials
    momCredentials: TwilioCredentials
  }
}

addFormats({
  'required-string': {
    validate: (val?: string): void => {
      if (val == undefined || val === '') {
        throw new Error('Required value cannot be empty')
      }
    },
  },
})

export const schema: Schema<ConfigSchema> = {
  frontendUrls: {
    frontendGovtBase: {
      doc: 'The frontend government base url',
      env: 'FRONTEND_GOVT',
      format: String,
      default: 'http://localhost:3000',
    },
  },
  port: {
    doc: 'The port that the service listens on',
    env: 'PORT',
    format: 'int',
    default: 8080,
  },
  environment: {
    doc: 'The environment that Node.js is running in',
    env: 'NODE_ENV',
    format: ['development', 'staging', 'production', 'test'],
    default: 'development',
  },
  appEnv: {
    doc: 'The environment that the application is running in',
    env: 'APP_ENV',
    format: ['dev', 'stg', 'prod', 'test'],
    default: 'dev',
  },
  isDowntime: {
    doc: 'Whether CheckWho is experiencing downtime',
    env: 'IS_DOWNTIME',
    format: Boolean,
    default: false,
  },
  awsRegion: {
    doc: 'The AWS region for SES. Optional, logs mail to console if absent',
    env: 'AWS_REGION',
    format: String,
    default: 'ap-southeast-1',
  },
  database: {
    username: {
      env: 'DB_USERNAME',
      sensitive: true,
      default: '',
      format: 'required-string',
    },
    password: {
      env: 'DB_PASSWORD',
      sensitive: true,
      default: '',
      format: 'required-string',
    },
    host: {
      env: 'DB_HOST',
      default: 'localhost',
      format: String,
    },
    port: {
      env: 'DB_PORT',
      default: 5432,
      format: Number,
    },
    name: {
      env: 'DB_NAME',
      default: '',
      format: 'required-string',
    },
    logging: {
      env: 'ENABLE_DB_LOGGING',
      default: false,
    },
    minPool: {
      env: 'DB_MIN_POOL_SIZE',
      default: 50,
    },
    maxPool: {
      env: 'DB_MAX_POOL_SIZE',
      default: 200,
    },
  },
  session: {
    name: {
      doc: 'Name of session ID cookie to set in response',
      env: 'SESSION_NAME',
      default: 'checkwho.sid',
      format: String,
    },
    secret: {
      doc: 'A secret string used to generate sessions for users',
      env: 'SESSION_SECRET',
      sensitive: true,
      default: 'toomanysecrets',
      format: String,
    },
    cookie: {
      maxAge: {
        doc: 'The maximum age for a cookie, expressed in ms',
        env: 'COOKIE_MAX_AGE',
        format: 'int',
        default: 24 * 60 * 60 * 1000, // 1 day
      },
    },
  },
  otp: {
    expiryPeriod: {
      doc: 'Validity of OTP, expressed in ms',
      env: 'OTP_EXPIRY_PERIOD',
      default: 15 * 60 * 1000, // 15 minutes to account for SGMail slowness
      format: Number,
    },
    numAllowedAttempts: {
      doc: 'Number of allowed attempts',
      env: 'OTP_NUM_ALLOWED_ATTEMPTS',
      default: 10,
      format: Number,
    },
  },
  uniqueParams: {
    defaultExpiryPeriod: {
      doc: 'Validity of unique params, expressed in seconds',
      env: 'UNIQUE_PARAMS_DEFAULT_EXPIRY_PERIOD',
      default: 3 * 24 * 60 * 60, // 3 days (arbitrary)
      format: Number,
    },
  },
  // used for sending OTP via email
  postman: {
    apiUrl: {
      doc: 'API endpoint for Postman.gov.sg',
      env: 'POSTMAN_API_URL',
      default: 'https://api.postman.gov.sg/v1/transactional/email/send',
      format: String,
    },
    apiKey: {
      doc: 'API key for Postman.gov.sg',
      env: 'POSTMAN_API_KEY',
      default: '',
      format: 'required-string',
    },
  },
  adminKey: {
    length: {
      doc: 'Byte length of API key',
      env: 'ADMIN_KEY_LENGTH',
      format: 'int',
      default: 64,
    },
    hash: {
      doc: 'Hash of active admin key',
      env: 'ADMIN_KEY_HASH',
      format: 'required-string',
      default: '',
    },
    algo: {
      doc: 'Algorithm for hashing key',
      env: 'ADMIN_KEY_ALGO',
      format: ['sha256', 'sha512'], // family of sha2 hash functions
      default: 'sha256',
    },
  },
  sgNotify: {
    baseUrl: {
      doc: 'Base URL for getting SGNotify public cert and making API calls',
      env: 'SGNOTIFY_URL',
      format: 'required-string',
      default: 'https://stg-ntf.singpass.gov.sg',
    },
    timeout: {
      doc: 'Client timeout for sgNotify API in milliseconds',
      env: 'SGNOTIFY_TIMEOUT',
      format: Number,
      default: 15000,
    },
    eServiceId: {
      doc: 'Human-readable identifier of us that doubles up as Key ID in JOSE implementation',
      env: 'SGNOTIFY_E_SERVICE_ID',
      format: 'required-string',
      default: '',
    },
    clientId: {
      doc: 'Username used to identify us to SGNotify',
      env: 'SGNOTIFY_CLIENT_ID',
      format: 'required-string',
      default: '',
    },
    clientSecret: {
      doc: 'Corresponding password to clientId',
      env: 'SGNOTIFY_CLIENT_SECRET',
      format: 'required-string',
      default: '',
    },
    ecPrivateKey: {
      doc: 'Our elliptic curve private key used as part of JOSE implementation',
      env: 'SGNOTIFY_EC_PRIVATE_KEY',
      format: 'required-string',
      default: '',
    },
  },
  // used for sending SMS
  gogovsg: {
    apiUrl: {
      doc: 'API endpoint for GoGovSG',
      env: 'GO_API_URL',
      default: 'https://staging.go.gov.sg/api/v1/urls',
      format: String,
    },
    apiKey: {
      doc: 'API key for Postman.gov.sg',
      env: 'GO_API_KEY',
      default: '',
      format: 'required-string',
    },
  },
  twilio: {
    defaultCredentials: {
      accountSid: {
        doc: 'Default Twilio account SID (using Postman creds for now)',
        env: 'DEFAULT_TWILIO_ACCOUNT_SID',
        format: 'required-string',
        default: '',
      },
      apiKeySid: {
        doc: 'Default Twilio API key SID (using Postman creds for now)',
        env: 'DEFAULT_TWILIO_API_KEY_SID',
        format: 'required-string',
        default: '',
      },
      apiKeySecret: {
        doc: 'Default Twilio API key secret (using Postman creds for now)',
        env: 'DEFAULT_TWILIO_API_KEY_SECRET',
        format: 'required-string',
        default: '',
      },
      senderId: {
        doc: 'Default Twilio sender ID (using Postman creds for now)',
        env: 'DEFAULT_TWILIO_SENDER_ID',
        format: 'required-string',
        default: '',
      },
    },
    ogpCredentials: {
      accountSid: {
        doc: 'OGP Twilio account SID',
        env: 'OGP_TWILIO_ACCOUNT_SID',
        format: 'required-string',
        default: '',
      },
      apiKeySid: {
        doc: 'OGP Twilio API key SID',
        env: 'OGP_TWILIO_API_KEY_SID',
        format: 'required-string',
        default: '',
      },
      apiKeySecret: {
        doc: 'OGP Twilio API key secret',
        env: 'OGP_TWILIO_API_KEY_SECRET',
        format: 'required-string',
        default: '',
      },
      senderId: {
        doc: 'OGP Twilio sender ID',
        env: 'OGP_TWILIO_SENDER_ID',
        format: 'required-string',
        default: '',
      },
    },
    // for now, we are loading agency's Twilio creds as env vars
    // in the future, we should encrypt using KMS and store them in the DB
    // they're not required because on staging, we use the default creds
    // NOTE: we should make sure to load them in production
    mohCredentials: {
      accountSid: {
        doc: 'MOH Twilio account SID',
        env: 'MOH_TWILIO_ACCOUNT_SID',
        format: 'required-string',
        default: '',
      },
      apiKeySid: {
        doc: 'MOH Twilio API key SID',
        env: 'MOH_TWILIO_API_KEY_SID',
        format: 'required-string',
        default: '',
      },
      apiKeySecret: {
        doc: 'MOH Twilio API key secret',
        env: 'MOH_TWILIO_API_KEY_SECRET',
        format: 'required-string',
        default: '',
      },
      senderId: {
        doc: 'MOH Twilio sender ID',
        env: 'MOH_TWILIO_SENDER_ID',
        format: 'required-string',
        default: '',
      },
    },
    momCredentials: {
      accountSid: {
        doc: 'MOM Twilio account SID',
        env: 'MOM_TWILIO_ACCOUNT_SID',
        format: 'required-string',
        default: '',
      },
      apiKeySid: {
        doc: 'MOM Twilio API key SID',
        env: 'MOM_TWILIO_API_KEY_SID',
        format: 'required-string',
        default: '',
      },
      apiKeySecret: {
        doc: 'MOM Twilio API key secret',
        env: 'MOM_TWILIO_API_KEY_SECRET',
        format: 'required-string',
        default: '',
      },
      senderId: {
        doc: 'MOM Twilio sender ID',
        env: 'MOM_TWILIO_SENDER_ID',
        format: 'required-string',
        default: '',
      },
    },
  },
}
