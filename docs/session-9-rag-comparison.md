# Session 9 — RAG vs Base-Model Comparison

_Generated 2026-09-02 by `backend/scripts/rag_compare.py`._

Each question is asked twice: once to the foundation model alone (**base model**), and once through Retrieval-Augmented Generation over the Amazon Bedrock Knowledge Base (**RAG**), which retrieves passages from the travel documents synced to S3 before answering.


## 1. What documents are required for a single-entry short-term stay visa to Japan?

### Base model (no documents)

To apply for a single-entry short-term stay visa to Japan, you will need to prepare several documents. Here’s a general list of what you might need:

1. **Visa Application Form**: 
   - A completed and signed visa application form.

2. **Passport**:
   - Your valid passport with at least six months of validity remaining from the date of entry into Japan.
   - The passport should have at least two blank visa pages.

3. **Passport-sized Photographs**:
   - Usually, one recent passport-sized photograph that meets the specific requirements of the Japanese embassy or consulate (e.g., size, background color, etc.).

4. **Invitation Letter**:
   - If you are visiting friends or family, an invitation letter from your host in Japan.
   - If you are on a business visit, an invitation letter from the Japanese company.
   - If you are a tourist, a hotel reservation or an itinerary might be required.

5. **Travel Itinerary**:
   - A copy of your round-trip flight reservation.
   - Sometimes a detailed itinerary of your stay in Japan.

6. **Proof of Financial Means**:
   - Bank statements or other documents showing that you have sufficient funds to cover your stay in Japan.
   - This might include salary slips, employment letter, or a letter from your bank.

7. **Visa Fee**:
   - The visa application fee, which varies depending on the country and type of visa. It is usually paid at the time of application.

8. **Cover Letter**:
   - A cover letter explaining the purpose of your visit, your itinerary, and other relevant details.

9. **Employment Letter**:
   - If you are employed, a letter from your employer stating your position, length of employment, and approval for leave.

10. **Proof of Relationship**:
    - If you are visiting family, documents such as a family registry (koseki-tōkei) or proof of relationship with your host.

11. **Other Supporting Documents**:
    - Depending on your specific situation, you might need additional documents, such as a letter of acceptance if you are visiting for educational purposes, proof of accommodation, etc.

Requirements can vary slightly depending on the specific Japanese embassy or consulate and the type of visa you are applying for (e.g., tourist, business, visiting family). It's always a good idea to check the specific requirements for the embassy or consulate where you will be applying and to apply well in advance of your planned travel date.

### RAG (grounded in Knowledge Base)

The documents required for a single-entry short-term stay visa to Japan include:
- Valid passport
- Visa application form
- Photo
- Flight itinerary with flight/ship number and date of arrival and departure to and from Japan
- Depending on the purpose of visit:
  - For business purposes: Document to prove the business purpose (e.g., travel order issued by employer, letter from employer)
  - For visiting relatives/friends: Document to prove kinship or friendship
  - For tourism: Document to prove ability to pay travel expenses (e.g., income certificate, tax return, bank statement)
- Itinerary in Japan

**Sources:** single-entry-short-term-visa-japan.pdf


## 2. What items should I pack for a trip to Japan?

### Base model (no documents)

Packing for a trip to Japan can be straightforward if you consider the country's unique cultural, seasonal, and practical aspects. Here's a comprehensive list to guide you:

### Clothing
- **Seasonal Appropriate Gear**: Japan has four distinct seasons. Check the weather forecast for your travel dates.
  - **Spring/Fall**: Lightweight layers (jackets, sweaters), comfortable walking shoes.
  - **Summer**: Lightweight, breathable clothing, swimwear (if you plan to visit the beach or an onsen).
  - **Winter**: Warm coats, hats, gloves, scarves, and good-quality winter boots.

- **Casual Wear**: T-shirts, jeans, skirts, dresses, and comfortable walking shoes.

- **Formal Wear**: If you plan to visit temples, shrines, or attend formal events, pack a modest dress or suit.

- **Traditional Wear**: A yukata (casual kimono) if you want to experience traditional Japanese attire.

### Footwear
- Comfortable walking shoes (for city exploration).
- Slippers (required for hotels, ryokans, and some traditional accommodations).
- If visiting mountainous areas or hot springs, consider bringing water shoes or sandals.

### Accessories
- A lightweight, foldable umbrella or raincoat (Japan can be rainy).
- A small daypack for day trips.
- A reusable water bottle (tap water is safe to drink in Japan).
- A power bank for charging electronic devices.
- A universal travel adapter (Japan uses Type A and B power outlets).

### Toiletries
- Basic toiletries (toothbrush, toothpaste, shampoo, conditioner, soap).
- Sunscreen (important in summer).
- Any personal medications you might need.

### Documents and Money
- Passport and necessary visas.
- Travel insurance documents.
- Copies of important documents (hotel reservations, travel itinerary, etc.).
- Cash (Japanese yen) and a credit card.
- A travel guidebook or offline maps.

### Electronics
- Smartphone and charger.
- Camera (if you plan to take lots of photos).
- Portable Wi-Fi device (optional, but helpful for staying connected).

### Miscellaneous
- A small gift for your hosts or friends (optional but appreciated).
- Travel-sized first-aid kit.
- A small sewing kit or safety pins for quick fixes.
- Any necessary travel apps (for navigation, translation, etc.).

### Cultural Considerations
- Be respectful when visiting temples and shrines; some may have specific dress codes.
- Learn a few basic Japanese phrases to enhance your experience.

Packing wisely will ensure you’re comfortable and ready to enjoy everything Japan has to offer. Safe travels!

### RAG (grounded in Knowledge Base)

Based on the provided context, the comprehensive packing list for a trip to Japan includes items organized into 9 categories:

1. **Clothing**: Casual Shirts / T-Shirts, Casual Pants / Shorts, Pajamas / Slippers, Sweater(s), Undergarments, Socks, Shoes / Sandals, Belt, Hats / Scarves / Gloves, Jacket / Coat, Swimwear, Workout Clothes / Shoes, Smart-Casual Clothing, Nylons
2. **Personal Hygiene**: Dental care items, grooming items, cosmetics, skincare items
3. **Documentation**: Passport, Visa, Tickets, Mobile/WiFi reservations
4. **Travel Aid**: Comfort items for the journey
5. **Electronic Devices**: Essential technology with power adapters
6. **Daily Essentials**: Financial and personal organization items
7. **Medication**: Prescription medications (with a research restriction note)
8. **Miscellaneous**: Small Gifts, Japanese Dictionary
9. **Baby/Child Items**: Snacks & Wipes, Clothes / Socks / Shoes, Coat / Hat / Gloves, Favorite Pillow, Games / Toys / Stuffed Animals, Coloring Books / Crayons / Pencils, Diapers, Diaper Ointment, Baby Shampoo / Soap, Nursing Cover / Breast Pump, Formula, Bottles / Sippy Cup, Blanket, Baby Carrier, Toys, Swimwear, Swim Diapers

Items highlighted in green can be easily purchased in Japan.

**Sources:** Japan-Packing-List.pdf


## 3. What are the must-see attractions in Kyoto?

### Base model (no documents)

Kyoto, Japan, is renowned for its rich cultural heritage, stunning temples, and picturesque landscapes. Here are some must-see attractions:

1. **Fushimi Inari Taisha**:
   - Famous for its thousands of vermilion torii gates that create a tunnel-like path up the mountain.
   - Located in Fushimi-ku.

2. **Kinkaku-ji (Golden Pavilion)**:
   - A Zen Buddhist temple covered in gold leaf.
   - Situated in Kita-ku.

3. **Gion District**:
   - Known for its traditional wooden machiya houses and geisha culture.
   - Ideal for exploring during the evening for a glimpse of geishas.

4. **Kiyomizu-dera**:
   - A historic temple with a wooden stage that offers panoramic views of Kyoto.
   - Located in Higashiyama-ku.

5. **Arashiyama Bamboo Grove**:
   - A serene bamboo forest that’s particularly beautiful in the morning or evening.
   - Located in the western part of the city.

6. **Nijo Castle**:
   - A historic castle with beautiful gardens and intricate architecture.
   - Located in Nakagyo-ku.

7. **Philosopher’s Path**:
   - A scenic walking path along a canal lined with cherry trees.
   - Located in the eastern part of the city.

8. **Kinkaku-ji (Silver Pavilion)**:
   - A beautiful Zen temple known for its reflective surface.
   - Located in Kita-ku.

9. **Tofuku-ji**:
   - One of the five most famous Zen temples in Kyoto, known for its beautiful gardens and autumn foliage.
   - Located in Higashiyama-ku.

10. **Nanzen-ji**:
    - A historic temple complex with beautiful gardens.
    - Located in Higashiyama-ku.

11. **Daitoku-ji**:
    - A network of Zen temples, including many sub-temples and gardens.
    - Located in the northern part of the city.

12. **Kyoto Imperial Palace**:
    - The former residence of the Imperial family, offering a glimpse into Japan’s royal history.
    - Located in Kamigyo-ku.

13. **Ryoan-ji**:
    - Famous for its rock garden, considered one of the finest examples of kare-sansui (dry landscape).
    - Located in Ukyō-ku.

14. **Sanjusangendo**:
    - A hall with a thousand gilded statues of Kannon, the goddess of mercy.
    - Located in Higashiyama-ku.

15. **Ninna-ji**:
    - Known for its beautiful gardens and the Five-story Pagoda.
    - Located in the southern part of the city.

These attractions showcase the historical and cultural richness of Kyoto, making it a must-visit destination for travelers.

### RAG (grounded in Knowledge Base)

The must-see attractions in Kyoto are:

1. **Fushimi Inari Taisha:** Famous for its thousands of vibrant vermilion *torii* gates winding up the sacred Mount Inari.
2. **Kiyomizu-dera:** A spectacular wooden temple built into the side of a mountain, offering panoramic views of the city.
3. **Kinkaku-ji (The Golden Pavilion):** A breathtaking Zen temple whose top two floors are completely covered in gold leaf.
4. **Arashiyama Bamboo Grove:** Walk through the towering, otherworldly bamboo stalks.
5. **Gion District:** Kyoto's most famous Geisha district.
6. **Nijo Castle:** The former Kyoto residence of the Tokugawa shogun, featuring beautiful gardens and "nightingale floors."

**Sources:** Kyoto_Travel_Guide_EN.md


## 4. What payment methods should an Indonesian traveller prepare before going abroad?

### Base model (no documents)

When travelling abroad, Indonesian travellers should consider the following payment methods to ensure a smooth experience:

### 1. **Local Currency:**
   - **Carry some cash:** It's always good to have local currency on hand for small purchases, transportation, or places that do not accept cards.

### 2. **Credit and Debit Cards:**
   - **International Cards:** Ensure your credit and debit cards are enabled for international transactions. Visa, Mastercard, and American Express are widely accepted.
   - **Notify Your Bank:** Inform your bank about your travel plans to avoid your card being blocked for suspicious activity.
   - **Backup Cards:** Carry at least two credit/debit cards from different banks in case one gets lost or stolen.

### 3. **Digital Wallets and Mobile Payment Apps:**
   - **GoPay:** Popular in Indonesia, but check its acceptance abroad.
   - **International Apps:** Consider setting up an account with international apps like PayPal, Apple Pay, Google Pay, or Samsung Pay.

### 4. **Prepaid Travel Cards:**
   - **Travel Cards:** Consider getting a prepaid travel card that can be loaded with Indonesian Rupiah (IDR) and used abroad. These often have lower fees than regular credit cards.

### 5. **Bank Accounts:**
   - **International Accounts:** If you will be spending a significant amount of time abroad, consider opening an international bank account or using a bank that offers low or no foreign transaction fees.

### 6. **Cash Withdrawals:**
   - **ATMs:** Use ATMs that are part of your bank's network to avoid high fees. Inform your bank beforehand to avoid card blocking.
   - **Currency Exchange:** Change some money into the local currency before you leave Indonesia or use reliable exchange services abroad.

### 7. **Travel Insurance:**
   - **Card Coverage:** Check if your credit card offers travel insurance and understand what it covers (e.g., trip cancellation, lost luggage).
   - **Additional Insurance:** Consider purchasing additional travel insurance for more comprehensive coverage.

### 8. **Emergency Funds:**
   - **Backup Cash:** Keep a small amount of cash in a secure place as an emergency fund.

### 9. **Local Payment Methods:**
   - **Familiarize Yourself:** Understand the local payment methods and preferences in the country you're visiting, such as mobile payments or local bank transfers.

By preparing these payment methods, Indonesian travellers can enjoy a hassle-free experience while abroad.

### RAG (grounded in Knowledge Base)

An Indonesian traveler should prepare the following payment methods before going abroad:

1. **Cross-Border QRIS**: For countries where Cross-Border QRIS is available, such as Thailand, Malaysia, and Singapore. Use Indonesian mobile banking apps or e-wallets to make cashless payments.
   
2. **International Debit and Multi-Currency Cards**: For destinations where QRIS is not yet active or for ATM cash withdrawals, use debit cards with Visa or Mastercard logos, ensuring international transactions are activated. Additionally, consider multi-currency accounts like Jenius, Bank Jago, or Wise for direct debits in local currency with zero foreign exchange fees.

Refer to the specific sections in the context for detailed instructions on how to transact using these payment methods.

**Sources:** indonesian-traveler-payment-guide.md, indonesia-customs-and-imei-guide.md


## 5. What are the IMEI registration and customs rules when bringing a phone into Indonesia?

### Base model (no documents)

When bringing a phone into Indonesia, there are specific IMEI registration and customs rules you need to be aware of:

### IMEI Registration

1. **IMEI Registration Requirement**:
   - **For Tourists and Short-term Visitors**: If you are visiting Indonesia as a tourist or for a short-term visit (up to 60 days), you do not need to register your phone's IMEI number.
   - **For Long-term Visitors**: If you plan to stay longer than 60 days, you must register the IMEI numbers of your phones with the Indonesian authorities. This is to prevent the use of stolen or blacklisted devices within the country.

2. **How to Register**:
   - You can register your IMEI number online through the official Indonesian Customs and Excise website. The process typically involves filling out a form with your personal information and the IMEI numbers of your devices.

3. **Consequences of Non-compliance**:
   - Failure to register your IMEI numbers if required can result in fines, confiscation of the device, or other penalties upon departure or during a customs check.

### Customs Rules

1. **Temporary Importation**:
   - **For Tourists**: If you're bringing a phone into Indonesia for personal use during your stay, you can generally do so without paying import duties, provided it's for personal use and you intend to take it out of the country when you leave. 
   - **Duty-Free Allowance**: Usually, one mobile phone per person is allowed duty-free under temporary importation rules, as long as it is for personal use and you can prove that you will take it out of the country within the allowed period.

2. **Value and Quantity**:
   - Make sure your phone(s) do not exceed the duty-free limit. If you are bringing multiple phones or phones with a high value, you may need to pay customs duties and taxes.

3. **Declaration**:
   - When entering Indonesia, you will need to declare all electronic devices, including phones, on your customs declaration form. This is to ensure transparency and compliance with customs regulations.

4. **Prohibited Items**:
   - Check if there are any specific restrictions or prohibitions on certain types of devices or accessories that may not be allowed into Indonesia.

### Practical Tips

- **Keep Documentation**: Maintain receipts, original packaging, and any documentation related to the purchase of your phone, as you may need to present these if questioned by customs officials.
- **Check for Updates**: Regulations can change, so it’s a good idea to check the latest rules from the official Indonesian Customs and Excise website or consult with the airline or a customs broker before traveling.

By adhering to these rules and regulations, you can ensure a smooth entry into Indonesia with your phone.

### RAG (grounded in Knowledge Base)

**IMEI Registration Rules for Purchased Smartphones, Handheld Computers, and Tablets:**
- International travelers bringing new mobile phones, tablets, or cellular devices purchased abroad into Indonesia must register the device IMEI numbers to access Indonesian domestic cellular networks (Telkomsel, Indosat, XL, Smartfren).
- Each traveler is permitted to register a maximum of two (2) devices per arrival.
- Registration can be done by filling out the Electronic Customs Declaration (e-CD) or the dedicated IMEI registration form at the official portal (beacukai.go.id/register-imei.html) or via the Mobile Bea Cukai app prior to arrival. This generates a QR Code and Registration ID.

**Customs Rules:**
- If the device value is under USD 500, no import duty or taxes are due (it is 100% free under the passenger allowance).
- If the device value exceeds USD 500 and is registered at the airport customs terminal before exiting the customs control area, the excess value above USD 500 is subject to:
  - Import Duty (Bea Masuk): 10% of customs value.
  - Value Added Tax (PPN): 11% of import value.
- Registration carried out after exiting the airport customs area (within 60 days of arrival at a local customs office) forfeits the USD 500 exemption allowance, meaning taxes are calculated on the full purchase price of the device.

**Sources:** indonesia-customs-and-imei-guide.md, indonesian-traveler-payment-guide.md


---

## Observations

- **Specificity.** The base model gives long, generic checklists that could apply to any country. RAG answers are shorter and quote the actual document — e.g. Indonesia's IMEI rule with the exact USD 500 threshold, 10% import duty and 11% VAT, and the `beacukai.go.id` portal, none of which the base model states.

- **Verifiability.** Every RAG answer names its source file, so the traveller can open the original PDF/Markdown and confirm. The base model cites nothing.

- **Freshness.** RAG reflects whatever is currently synced to the Knowledge Base (the April 2025 Japan visa checklist, the current Indonesian customs guide); the base model is frozen at its training cutoff and hedges with "check the latest guidelines".

- **Coverage.** Each of the 5 questions was answered from a different document in the Knowledge Base, showing retrieval picks the right source per question.


_KB: `EW7EM5BPON` · region `ap-southeast-2` · retrieval: managed search, top 5 · generation: `amazon.nova-lite-v1:0`._
