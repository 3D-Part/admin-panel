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
        'An offer has its own steps (e.g. proforma sent, paid). The step that sets Accepted turns it into an order. Until then it holds no stock. Analytics count an order as sold once it is sent or ready for pickup.',
        'Company orders (bank transfer) arrive straight in Offers. Send the offer with the envelope icon on the row; put your bank account in Settings → Company details first.',
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
        'Employees → edit: for each section pick No access, View, or View and edit. Accounts marked Full access are owners and are not edited there.',
        'Export on Orders, Products and Users saves a CSV that opens in Excel. Analytics filters by category, manufacturer and customer.',
      ],
    },
    {
      title: 'Newsletter (Zoho Campaigns)',
      lines: [
        'How it works: the admin keeps the subscribers and writes the mail; Zoho Campaigns sends it, counts opens and adds the unsubscribe link. Only people who subscribed to the newsletter are on the list, not every registered customer.',
        'Once: Settings → Zoho Campaigns → Connect (Client ID, Client Secret and the code from api-console.zoho.eu → Self Client, within 10 minutes). Pick the newsletter list (3DPart pretplatnici) and the test list (3DPart test), tick the senders Zoho shows as Verified (Zoho → Settings → Email → Senders), Save. Check the connection shows Zoho\'s own answer.',
        'In Zoho itself only once: the sender address must be Verified and the company address filled in (Settings → General → Organization); without the address Zoho sends nothing.',
        'Subscribers: the numbers on top show who is in Zoho, waits for confirmation, unsubscribed or has an error, and how much of the Zoho plan is used this month (free plan: 2,000 contacts, 6,000 mails a month).',
        'Add subscriber puts one address into the shop and onto the Zoho list. New subscribers from the site go onto the list by themselves. Sync with Zoho puts everyone missing onto the list and brings unsubscribes back.',
        'A campaign, step by step: 1) New campaign. 2) Recipients: Everyone on the Zoho list, or Only the subscribers ticked in the table (tick them first; they get a Zoho list of their own and nobody else is reached). 3) Sender, subject and text; the headline is optional (the subject is used). 4) Send a test to me: it goes only to the test list, marked [PROBA]; check it in your inbox. 5) Send to everyone / Send to N ticked: it asks once more with the number of people.',
        'The list of campaigns shows each one: Test, In Zoho, not sent (the Send button sends it), Sending, Sent with the number of people, or Failed with Zoho\'s reason.',
        'Send email (next to New campaign) is not Zoho: it sends a plain mail straight from the shop, to all subscribers or only the ticked ones. Use it rarely; newsletters go through Zoho.',
        'Zoho adds the unsubscribe link to every mail. Who unsubscribes gets no more newsletters and shows as Unsubscribed after the next sync. If a campaign fails, the red line under it says why (e.g. a sender not verified, the connection gone: Connect again).',
      ],
    },
    {
      title: 'Groups, flags and the chat',
      lines: [
        'Products → Product groups: who is published, in Super offer, Most sold or recommended in the cart. Search on the right, add one or many; take out on the left.',
        'Settings → Customer statuses and Order flags: name and color of each flag. Red customer statuses mean disputed.',
        'Settings → Chat assistant: one AI is active at a time (ChatGPT or Claude); the table below shows what it cost.',
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
        'Ponuda ima svoje korake (npr. predračun poslan, plaćeno). Korak koji postavlja Prihvaćena pretvara je u narudžbu. Do tada ne drži robu. Analitika broji narudžbu kao prodanu tek kad je poslana ili spremna za preuzimanje.',
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
        'Zaposleni → izmjena: za svaku sekciju izaberi Bez pristupa, Pregled ili Pregled i uređivanje. Nalozi s oznakom Puni pristup su vlasnički i tu se ne uređuju.',
        'Izvoz na Narudžbama, Artiklima i Kupcima snima CSV koji se otvara u Excelu. Analitika se filtrira po kategoriji, proizvođaču i kupcu.',
      ],
    },
    {
      title: 'Newsletter (Zoho Campaigns)',
      lines: [
        'Kako radi: admin čuva pretplatnike i piše mejl, a Zoho Campaigns ga šalje, broji otvaranja i dodaje link za odjavu. Na listi su samo ljudi koji su se prijavili na newsletter, ne svi registrovani kupci.',
        'Jednom: Podešavanja → Zoho Campaigns → Poveži (Client ID, Client Secret i kod iz api-console.zoho.eu → Self Client, u roku od 10 minuta). Izaberi listu za newsletter (3DPart pretplatnici) i test listu (3DPart test), označi pošiljaoce koje Zoho prikazuje kao Verified (Zoho → Settings → Email → Senders), pa Sačuvaj. Provjeri vezu pokazuje Zohov odgovor.',
        'U samom Zohu samo jednom: adresa pošiljaoca mora biti Verified i upisana adresa firme (Settings → General → Organization); bez adrese Zoho ne šalje ništa.',
        'Pretplatnici: brojevi na vrhu pokazuju ko je u Zohu, ko čeka potvrdu, ko se odjavio, gdje je greška, i koliko je Zoho paketa potrošeno ovaj mjesec (besplatni paket: 2.000 kontakata, 6.000 mejlova mjesečno).',
        'Dodaj pretplatnika upisuje jednu adresu u prodavnicu i na Zoho listu. Novi pretplatnici sa sajta sami idu na listu. Sinhronizuj sa Zohom stavlja na listu sve koji fale i vraća odjave.',
        'Kampanja, korak po korak: 1) Nova kampanja. 2) Primaoci: Svi na Zoho listi, ili Samo pretplatnici označeni u tabeli (prvo ih označi; dobiju svoju Zoho listu i niko drugi ne dobija mejl). 3) Pošiljalac, naslov i tekst; glavni naslov u mejlu nije obavezan (uzima se naslov). 4) Pošalji probu meni: ide samo na test listu, s oznakom [PROBA]; provjeri je u svom sandučetu. 5) Pošalji svima / Pošalji označenim (N): još jednom pita s brojem ljudi.',
        'Lista kampanja pokazuje svaku: Proba, U Zohu, nije poslano (dugme Pošalji je šalje), Šalje se, Poslano s brojem ljudi, ili Nije uspjelo sa Zohovim razlogom.',
        'Pošalji mejl (pored Nove kampanje) nije Zoho: šalje običan mejl direktno iz prodavnice, svim pretplatnicima ili samo označenim. Koristi ga rijetko; newsletter ide preko Zoha.',
        'Zoho u svaki mejl dodaje link za odjavu. Ko se odjavi više ne dobija newsletter i poslije sljedeće sinhronizacije piše Odjavljen. Ako kampanja ne uspije, crveni red ispod nje kaže zašto (npr. pošiljalac nije potvrđen, veza prekinuta: ponovo Poveži).',
      ],
    },
    {
      title: 'Grupe, zastavice i chat',
      lines: [
        'Artikli → Grupe proizvoda: šta je objavljeno, u Super ponudi, Najprodavanije ili preporučeno u korpi. Desno pretraga i dodavanje jednog ili više, lijevo izbacivanje.',
        'Podešavanja → Statusi kupaca i Zastavice narudžbi: naziv i boja svake zastavice. Crveni statusi kupaca znače sporan kupac.',
        'Podešavanja → Chat asistent: aktivan je jedan AI (ChatGPT ili Claude); tabela ispod pokazuje koliko je koštao.',
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
