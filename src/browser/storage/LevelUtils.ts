import { LevelUp } from 'levelup'
import { RepositoryResult } from './RepositoryResult'
import { ErrorCode } from './ErrorCode'
import { RepositoryError } from './RepositoryError'

export async function GetRepositoryResult<T>(
  db: LevelUp,
  key: string,
  transform: (value: T) => T = (value: T): T => value
): Promise<RepositoryResult<T>> {
  try {
    const value = await db.get(key)
    return new RepositoryResult<T>(transform(value) as T)
  } catch (error) {
    if (error.notFound) {
      return new RepositoryResult<T>(
        undefined,
        new RepositoryError(ErrorCode.NotFound, 'Not Found: ' + error.message)
      )
    }

    return new RepositoryResult<T>(
      undefined,
      new RepositoryError(
        ErrorCode.InternalError,
        'Internal Error: ' + error.message
      )
    )
  }
}
