import { Schema, addFormats } from 'convict'

export interface ConfigSchema {
  frontend_urls: {
    frontend_govt_base: string
  }
  port: number
  environment: 'development' | 'staging' | 'production' | 'test'
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
  totp: {
    expiry: number
    numValidPastWindows: number
    numValidFutureWindows: number
    secret: string
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
    eServiceId: string
    clientId: string
    clientSecret: string
    sgNotifyPublicKey: string
    ecPrivateKey: string
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
  frontend_urls: {
    frontend_govt_base: {
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
      format: String,
    },
    password: {
      env: 'DB_PASSWORD',
      sensitive: true,
      default: '',
      format: String,
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
        default: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    },
  },
  totp: {
    expiry: {
      doc: 'Time step (seconds)',
      env: 'OTP_EXPIRY_IN_SECONDS',
      default: 60 * 15,
      format: Number,
    },
    numValidPastWindows: {
      doc: 'Tokens in the previous x-windows that should be considered valid',
      env: 'OTP_PAST_WINDOWS',
      default: 1,
      format: Number,
    },
    numValidFutureWindows: {
      doc: 'Tokens in the future x-windows that should be considered valid',
      env: 'OTP_FUTURE_WINDOWS',
      default: 0,
      format: Number,
    },
    secret: {
      doc: 'Secret for otp govt auth',
      env: 'OTP_SECRET',
      default: 'secretsecret',
      format: String,
    },
  },
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
    eServiceId: {
      doc: 'Human-readable identifier of us that doubles up as Key ID in JOSE implementation',
      env: 'SGNOTIFY_E_SERVICE_ID',
      format: 'required-string',
      default: '',
    },
    clientId: {
      doc: 'Username used to identify us to SGNotify',
      env: 'SGNOTIFY_CLIENT_ID',
      format: String,
      default: '',
    },
    clientSecret: {
      doc: 'Corresponding password to clientId',
      env: 'SGNOTIFY_CLIENT_SECRET',
      format: String,
      default: '',
    },
    sgNotifyPublicKey: {
      doc: "SGNotify API's public key used as part of JOSE implementation",
      env: 'SGNOTIFY_PUBLIC_KEY',
      format: String,
      default: '',
    },
    ecPrivateKey: {
      doc: 'Our elliptic curve private key used as part of JOSE implementation',
      env: 'SGNOTIFY_EC_PRIVATE_KEY',
      format: String,
      default: '',
    },
  },
}
