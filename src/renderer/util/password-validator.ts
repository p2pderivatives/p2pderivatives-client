export const isValidPassword = (password: string): string => {
  if (password.length < 8 || password.length > 32)
    return 'Password should be between 8 and 32 characters long.'
  if (!/\d/.test(password)) return 'Password should contain a number.'
  if (!/[^a-zA-Z0-9]/.test(password))
    return 'Password should contain a non-alphanumeric character.'
  if (!/[A-Z]/.test(password))
    return 'Password should contain an uppercase character'
  if (!/[a-z]/.test(password))
    return 'Password should contain a lowercase character'
  return ''
}
