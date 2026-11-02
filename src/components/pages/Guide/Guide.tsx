'use client'

import React, { useEffect, useState } from 'react'
import { Button } from 'flowbite-react'

type Language = 'en' | 'sr'
type Section = { title: string; lines: string[] }

const LANGUAGE_KEY = 'guideLanguage'

const SECTIONS: Record<Language, Section[]> = {
  en: [
    {
      title: 'Orders',
      lines: [
        'Click the status to change it. Steps: Accepted → In preparation → In delivery → Receipt issued. The dots show how far the order got.',
        'You can go back from any status. Stock follows by itself: New, Offer, Returned and Cancelled hold no stock.',
        'The customer gets an email on Accepted (new orders), the first In delivery, and Cancelled.',
        'The Invoice column is the paperwork: proforma sent, paid, invoiced. Choose it right in the row.',
        'Disputed: open the order and switch it on. Only that order is marked. Disputed only in the header filters them.',
      ],
    },
    {
      title: 'Offers and proformas',
      lines: [
        'Set an order to Offer and it moves to Orders → Offers. It holds no stock and is not in analytics until you accept it.',
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
      ],
    },
    {
      title: 'Settings',
      lines: [
        'Every part has its own item in the sidebar. Home slider is for the home page, Page images for everything else.',
        'Nothing reaches the site until you click Save Settings.',
      ],
    },
  ],
  sr: [
    {
      title: 'Narudžbe (Orders)',
      lines: [
        'Klikni na status da ga promijeniš. Koraci: Accepted (prihvaćeno) → In preparation (u pripremi) → In delivery (u dostavi) → Receipt issued (račun izdan). Kružići pokazuju dokle je narudžba stigla.',
        'Sa svakog statusa možeš se vratiti nazad. Stanje se samo ispravi: New, Offer, Returned i Cancelled ne drže robu sa stanja.',
        'Kupac dobija mejl na Accepted (kod novih narudžbi), na prvi In delivery i na Cancelled.',
        'Kolona Invoice je papirologija: predračun poslan, uplaćeno, fakturisano. Biraš je odmah u redu narudžbe.',
        'Sporna narudžba: otvori narudžbu i uključi Disputed. Označena je samo ta narudžba. Disputed only na vrhu prikazuje samo sporne.',
      ],
    },
    {
      title: 'Ponude i predračuni (Offers, Proformas)',
      lines: [
        'Stavi narudžbu na Offer i ona prelazi u Orders → Offers. Ne drži robu sa stanja i ne ulazi u analitiku dok je ne prihvatiš.',
        'Proformas → Send šalje predračun kupcu na mejl. Prvo upiši žiro račun u Settings → Company details.',
      ],
    },
    {
      title: 'Artikli i akcije (Products, Sales)',
      lines: [
        'Internal code / SKU je vaša šifra, a EAN je bar kod na pakovanju.',
        'Sales → otvori akciju → Add products: pronađi artikal, upiši akcijsku cijenu i klikni Add. Akcija se na sajtu vidi samo između svojih datuma.',
        'Actions needed pokazuje šta treba popraviti, a svaki red ima polje za vašu napomenu.',
      ],
    },
    {
      title: 'Magacin (Warehouse)',
      lines: [
        'Scanner: roba je stigla ili otišla, pa skeniraš i dodaš ili skineš komade. Stanje na sajtu se odmah mijenja.',
        'Inventory: stvari koje firma posjeduje, a ne prodaje (printeri, alat). Artikli za prodaju nisu tu.',
        'Labels štampa naljepnice s bar kodom. History pokazuje svaku promjenu stanja.',
        'Narudžbe same skidaju i vraćaju stanje, zato stanje za narudžbu nikad ne ispravljaj ručno.',
      ],
    },
    {
      title: 'Kupci (Users)',
      lines: [
        'Users → otvori kupca: označi ga kao spornog uz razlog, ili klikni Send password reset email. Kupac sam bira novu lozinku.',
      ],
    },
    {
      title: 'Podešavanja (Settings)',
      lines: [
        'Svaki dio ima svoju stavku u sidebaru. Home slider je za početnu stranicu, a Page images za sve ostale.',
        'Ništa ne ide na sajt dok ne klikneš Save Settings.',
      ],
    },
  ],
}

const Guide = () => {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    try {
      if (localStorage.getItem(LANGUAGE_KEY) === 'sr') setLanguage('sr')
    } catch {}
  }, [])

  const changeLanguage = (next: Language) => {
    setLanguage(next)
    try {
      localStorage.setItem(LANGUAGE_KEY, next)
    } catch {}
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {language === 'en' ? 'Guide' : 'Uputstvo'}
        </h2>
        <Button.Group>
          <Button
            size="sm"
            color={language === 'en' ? 'purple' : 'gray'}
            onClick={() => changeLanguage('en')}
          >
            EN
          </Button>
          <Button
            size="sm"
            color={language === 'sr' ? 'purple' : 'gray'}
            onClick={() => changeLanguage('sr')}
          >
            SR
          </Button>
        </Button.Group>
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
