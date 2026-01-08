import { RouteError } from './route-error.ts';

const file_re = /^(?!\.)[A-Za-z0-9._-]+$/;

/** trim e não aceita string vazia */
function string(x: unknown) {
  if (typeof x !== 'string') return undefined;
  const s = x.trim();
  if (s.length === 0) return undefined;
  return s;
}

/** se a string for number like, retorna como number */
function number(x: unknown) {
  if (typeof x === 'number') {
    return Number.isFinite(x) ? x : undefined;
  }
  if (typeof x === 'string' && x.trim().length !== 0) {
    const n = Number(x);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** aceita valores como true, 'true', 1, '1' e 'on' */
function boolean(x: unknown) {
  if (x === true || x === 'true' || x === 1 || x === '1' || x === 'on')
    return true;
  if (x === false || x === 'false' || x === 0 || x === '0' || x === 'off')
    return false;
  return undefined;
}

/** verifica se é um objeto {} */
function object(x: unknown): Record<string, unknown> | undefined {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
    ? (x as Record<string, unknown>)
    : undefined;
}

const email_re = /^[^@]+@[^@]+\.[^@]+$/;

function email(x: unknown) {
  const s = string(x)?.toLowerCase();
  if (s === undefined) return undefined;
  return email_re.test(s) ? s : undefined;
}

const password_re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

/** mínimo 10 e máximo 256, pelo menos 1 caixa alta, 1 baixa e 1 digito */
function password(x: unknown) {
  if (typeof x !== 'string') return undefined;
  if (x.length < 10 || x.length > 256) return undefined;
  return password_re.test(x) ? x : undefined;
}

/** ensures that the username has more than 3 letters   */
function username(x: unknown) {
  if (typeof x !== 'string') return undefined;
  const s = string(x);
  if (s === undefined) return undefined;
  return s.length >= 3 ? s : undefined;
}

/** This function checks whether the input is a valid file string.  */
function file(x: unknown) {
  if (typeof x !== 'string') return undefined;
  return file_re.test(x) ? x : undefined;
}

type Parse<Value> = (x: unknown) => Value | undefined;

function required<Value>(fn: Parse<Value>, error: string) {
  return (x: unknown) => {
    const value = fn(x);
    if (value === undefined) throw new RouteError(error, 422);
    return value;
  };
}

export const v = {
  string: required(string, 'expected string'),
  number: required(number, 'expected number'),
  boolean: required(boolean, 'expected boolean'),
  object: required(object, 'expected object'),
  email: required(email, 'invalid email'),
  username: required(username, 'invalid username'),
  password: required(password, 'invalid password'),
  file: required(file, 'invalid file'),
  o: {
    string,
    number,
    boolean,
    object,
    email,
    username,
    password,
    file,
  },
};
