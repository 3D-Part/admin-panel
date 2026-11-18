'use client'

import React from 'react'
import { Language, useLanguageStore } from '@/shared/i18n'

type Section = { title: string; lines: string[] }

const SECTIONS: Record<Language, Section[]> = {
  en: [
    {
      title: 'Orders',
      lines: [
        'The status changes only with the checkboxes in the Invoice column. Each ticked step fills its circle; the status follows the rightmost ticked step that changes it.',
        'Clearing a checkbox moves the status back. Stock follows by itself: New, Offer, Returned and Cancelled hold no stock.',
        'The customer gets an email on Accepted (new orders), the first In delivery, and Cancelled (with the reason you write).',
        'The steps, their colors and which status each one sets are in Settings → Invoice statuses: one list for orders, one for offers.',
        'Disputed: open the order and switch it on. Only that order is marked. Disputed only in the header filters them.',
      ],
    },
    {
      title: 'Offers and proformas',
      lines: [
        'An offer has its own steps (e.g. proforma sent, paid). The step that sets Accepted turns it into an order. Until then it holds no stock and is not in analytics.',
        'Proformas → Send emails it to the customer. Put your bank account in Settings → Company details first.',
      ],
    },
    {
      title: 'Products and sales',
      lines: [
        'Internal code / SKU is your code, EAN is the barcode on the package.',
        'Sales → open a sale → Add products: search, enter the sale price, Add. The sale shows on the site only between its dates.',
        'Actions needed lists what to fix, and every row has a note for your team.',
      ],
    },
    {
      title: 'Warehouse',
      lines: [
        'Scanner: goods arrived or left, so scan and add or remove pieces. Site stock changes right away.',
        'Inventory: things you own and do not sell (printers, tools). Products for sale are not here.',
        'Labels prints barcode stickers. History shows every stock change.',
        'Orders take and return stock by themselves, so never correct stock for an order by hand.',
      ],
    },
    {
      title: 'Customers',
      lines: [
        'Users → open a customer: mark them disputed with a reason, or use Send password reset email. The customer picks the new password.',
        'Settings → Discount tiers: set how much a customer has to spend for each tier, counted over everything or only the last 12 months. A tier set by hand stays.',
      ],
    },
    {
      title: 'Employees and reports',
      lines: [
        'Employees → edit: tick what the person may see. Analytics, Warehouse and Proformas each have their own box.',
        'Export on Orders, Products and Users saves a CSV that opens in Excel. Analytics filters by category, manufacturer and customer.',
      ],
    },
    {
      title: 'Settings',
      lines: [
        'Every part has its own item in the sidebar. Home slider is for the home page, Page images for everything else.',
        'Nothing reaches the site until you click Save Settings.',
        'The EN | SR switch at the top right changes the language of the admin.',
      ],
    },
  ],
  sr: [
    {
      title: 'Narudžbe',
      lines: [
        'Status se mijenja samo kvačicama u koloni Račun. Svaki štiklirani korak popuni svoj kružić, a status prati najdesniji štiklirani korak koji ga mijenja.',
        'Skidanje kvačice vraća status nazad. Stanje se samo ispravi: Nova, Ponuda, Vraćena i Otkazana ne drže robu sa stanja.',
        'Kupac dobija mejl na Prihvaćena (kod novih narudžbi), na prvi U dostavi i na Otkazana (s razlogom koji upišeš).',
        'Koraci, njihove boje i koji status postavljaju su u Podešavanja → Statusi računa: jedna lista za narudžbe, jedna za ponude.',
        'Sporna narudžba: otvori narudžbu i uključi Sporna narudžba. Označena je samo ta narudžba. Samo sporne na vrhu prikazuje samo njih.',
      ],
    },
    {
      title: 'Ponude i predračuni',
      lines: [
        'Ponuda ima svoje korake (npr. predračun poslan, plaćeno). Korak koji postavlja Prihvaćena pretvara je u narudžbu. Do tada ne drži robu i ne ulazi u analitiku.',
        'Predračuni → Pošalji šalje predračun kupcu na mejl. Prvo upiši žiro račun u Podešavanja → Podaci o firmi.',
      ],
    },
    {
      title: 'Artikli i akcije',
      lines: [
        'Interna šifra / SKU je vaša šifra, a EAN je bar kod na pakovanju.',
        'Akcije → otvori akciju → Dodaj artikle: pronađi artikal, upiši akcijsku cijenu i klikni Dodaj. Akcija se na sajtu vidi samo između svojih datuma.',
        'Potrebne radnje pokazuje šta treba popraviti, a svaki red ima polje za vašu napomenu.',
      ],
    },
    {
      title: 'Magacin',
      lines: [
        'Skener: roba je stigla ili otišla, pa skeniraš i dodaš ili skineš komade. Stanje na sajtu se odmah mijenja.',
        'Inventar: stvari koje firma posjeduje, a ne prodaje (printeri, alat). Artikli za prodaju nisu tu.',
        'Naljepnice štampa naljepnice s bar kodom. Istorija pokazuje svaku promjenu stanja.',
        'Narudžbe same skidaju i vraćaju stanje, zato stanje za narudžbu nikad ne ispravljaj ručno.',
      ],
    },
    {
      title: 'Kupci',
      lines: [
        'Kupci → otvori kupca: označi ga kao spornog uz razlog, ili klikni Pošalji mejl za novu lozinku. Kupac sam bira novu lozinku.',
        'Podešavanja → Tierovi popusta: upiši koliko kupac treba da potroši za svaki tier, ukupno ili samo u zadnjih 12 mjeseci. Tier postavljen ručno ostaje.',
      ],
    },
    {
      title: 'Zaposleni i izvještaji',
      lines: [
        'Zaposleni → izmjena: označi šta osoba smije da vidi. Analitika, Magacin i Predračuni imaju svaki svoje polje.',
        'Izvoz na Narudžbama, Artiklima i Kupcima snima CSV koji se otvara u Excelu. Analitika se filtrira po kategoriji, proizvođaču i kupcu.',
      ],
    },
    {
      title: 'Podešavanja',
      lines: [
        'Svaki dio ima svoju stavku u meniju lijevo. Slajder na početnoj je za početnu stranicu, a Slike stranica za sve ostale.',
        'Ništa ne ide na sajt dok ne klikneš Sačuvaj podešavanja.',
        'Jezik admina mijenjaš dugmetom EN | SR gore desno.',
      ],
    },
  ],
}

const Guide = () => {
  // the language switch in the header covers the guide as well
  const language = useLanguageStore((state) => state.language)

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {language === 'en' ? 'Guide' : 'Uputstvo'}
        </h2>
      </div>
      {SECTIONS[language].map(({ title, lines }) => (
        <section
          key={title}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default Guide
