import { Order } from '@/shared/types'

export type MessageTemplate = {
  id: string
  // shown in the admin, translated there
  label: string
  // what the customer reads (in the shop's language); {name}, {number}, {total}
  text: string
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'pickup',
    label: 'Order ready for pickup',
    text: 'Poštovani {name},\n\nVaša narudžba {number} je spremna za preuzimanje u našoj poslovnici. Ukupan iznos je {total} KM.\n\nSrdačan pozdrav,\n3DPart',
  },
  {
    id: 'payment',
    label: 'Payment details',
    text: 'Poštovani {name},\n\nza narudžbu {number} molimo uplatu iznosa od {total} KM na naš žiro račun, uz poziv na broj {number}. Nakon uplate šaljemo vašu narudžbu.\n\nSrdačan pozdrav,\n3DPart',
  },
  {
    id: 'stock',
    label: 'Item not in stock',
    text: 'Poštovani {name},\n\nnažalost, jedan ili više artikala iz narudžbe {number} trenutno nije na stanju. Javit ćemo vam čim stignu, a ako želite, možemo poslati ostatak narudžbe odmah.\n\nSrdačan pozdrav,\n3DPart',
  },
  {
    id: 'delay',
    label: 'Delivery delay',
    text: 'Poštovani {name},\n\nisporuka narudžbe {number} kasni više nego što smo planirali. Izvinjavamo se zbog neugodnosti i javljamo se čim paket krene.\n\nSrdačan pozdrav,\n3DPart',
  },
  {
    id: 'info',
    label: 'More information needed',
    text: 'Poštovani {name},\n\nza obradu narudžbe {number} potrebne su nam dodatne informacije. Molimo vas da odgovorite na ovaj mejl.\n\nSrdačan pozdrav,\n3DPart',
  },
  {
    id: 'thanks',
    label: 'Thank you',
    text: 'Poštovani {name},\n\nhvala vam na narudžbi {number}. Ako imate bilo kakvo pitanje, slobodno nam se javite.\n\nSrdačan pozdrav,\n3DPart',
  },
]

/** The template text with the customer's name, the order number and the total filled in. */
export const fillTemplate = (template: MessageTemplate, order: Order) =>
  template.text
    .replace(/{name}/g, order.fullName || '')
    .replace(/{number}/g, order.orderNumber || '')
    .replace(/{total}/g, String(order.total ?? ''))
