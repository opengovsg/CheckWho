import { Injectable, NestMiddleware } from '@nestjs/common'
import { InjectConnection } from '@nestjs/typeorm'
import { Request, Response, NextFunction, RequestHandler } from 'express'
import session from 'express-session'
import { Connection } from 'typeorm'
import { TypeormStore } from 'connect-typeorm'

import { ConfigService } from 'core/providers'
import { Session } from 'database/entities'

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private middleware: RequestHandler

  constructor(
    private config: ConfigService,
    @InjectConnection() connection: Connection,
  ) {
    const sessionRepository = connection.getRepository(Session)

    this.middleware = session({
      resave: false,
      saveUninitialized: false, // do not save new sessions that have not been modified
      secret: this.config.get('session.secret'),
      cookie: {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: this.config.get('session.cookie.maxAge'),
        secure: !config.isDevEnv, // disable in local dev env
      },
      store: new TypeormStore({
        // for every new session, remove this many expired ones. Defaults to 0
        cleanupLimit: 2,
      }).connect(sessionRepository),
    })
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.middleware(req, res, next)
  }
}
