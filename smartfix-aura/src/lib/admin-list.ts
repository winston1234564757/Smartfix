
// Список email-адрес, які мають доступ до Адмінки

export const ADMIN_EMAILS = [

  "viktor.koshel24@gmail.com", // Зміни на свою реальну пошту, яку юзав при реєстрації!

  "admin@smartfix.com"

];



export function isUserAdmin(email?: string | null) {

  if (!email) return false;

  return ADMIN_EMAILS.includes(email);

}
