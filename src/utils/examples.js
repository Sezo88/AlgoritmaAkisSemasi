export const EXAMPLES = [
  {
    id: 'kare_alan',
    name: 'Karenin Alanı',
    icon: '⬜',
    description: 'Bir karenin kenar uzunluğunu alıp alanını hesaplar.',
    algorithm: `BAŞLA
OKU "Kenar uzunluğunu girin" kenar
alan = kenar * kenar
YAZ "Karenin alanı: ", alan
BİTİR`
  },
  {
    id: 'iki_sayi_toplam',
    name: 'İki Sayının Toplamı',
    icon: '➕',
    description: 'İki sayıyı okuyup toplamını hesaplar.',
    algorithm: `BAŞLA
OKU "Birinci sayıyı girin" sayi1
OKU "İkinci sayıyı girin" sayi2
toplam = sayi1 + sayi2
YAZ "Toplam: ", toplam
BİTİR`
  },
  {
    id: 'tek_cift',
    name: 'Tek / Çift Sayı',
    icon: '🔢',
    description: 'Girilen sayının tek mi çift mi olduğunu kontrol eder.',
    algorithm: `BAŞLA
OKU sayi
EĞER sayi % 2 == 0 İSE
  YAZ sayi, " çift sayıdır"
DEĞİLSE
  YAZ sayi, " tek sayıdır"
EĞER_BİTİR
BİTİR`
  },
  {
    id: 'en_buyuk',
    name: 'En Büyük Sayı',
    icon: '🏆',
    description: 'Üç sayı arasından en büyüğünü bulur.',
    algorithm: `BAŞLA
OKU "1. sayıyı girin" a
OKU "2. sayıyı girin" b
OKU "3. sayıyı girin" c
enBuyuk = a
EĞER b > enBuyuk İSE
  enBuyuk = b
EĞER_BİTİR
EĞER c > enBuyuk İSE
  enBuyuk = c
EĞER_BİTİR
YAZ "En büyük sayı: ", enBuyuk
BİTİR`
  },
  {
    id: 'faktoriyel',
    name: 'Faktöriyel Hesaplama',
    icon: '❗',
    description: 'N sayısının faktöriyelini hesaplar (N!).',
    algorithm: `BAŞLA
OKU n
sonuc = 1
DÖNGÜ i = 1, n, 1
  sonuc = sonuc * i
DÖNGÜ_BİTİR
YAZ n, "! = ", sonuc
BİTİR`
  },
  {
    id: 'toplam_1n',
    name: "1'den N'ye Toplam",
    icon: '📊',
    description: "1'den N'ye kadar olan sayıların toplamını hesaplar.",
    algorithm: `BAŞLA
OKU n
toplam = 0
DÖNGÜ i = 1, n, 1
  toplam = toplam + i
DÖNGÜ_BİTİR
YAZ "1'den ", n, "'e toplam: ", toplam
BİTİR`
  },
  {
    id: 'daire',
    name: 'Dairenin Alanı ve Çevresi',
    icon: '🔵',
    description: 'Yarıçapı verilen dairenin alan ve çevresini hesaplar.',
    algorithm: `BAŞLA
OKU r
pi = 3.14159
alan = pi * r * r
cevre = 2 * pi * r
YAZ "Alan: ", alan
YAZ "Çevre: ", cevre
BİTİR`
  },
  {
    id: 'sicaklik',
    name: 'Sıcaklık Çevirici',
    icon: '🌡️',
    description: "Celsius'tan Fahrenheit'a çevirir.",
    algorithm: `BAŞLA
OKU celsius
fahrenheit = (celsius * 9 / 5) + 32
YAZ celsius, "°C = ", fahrenheit, "°F"
BİTİR`
  },
  {
    id: 'ucgen_alan',
    name: 'Üçgenin Alanı',
    icon: '🔺',
    description: 'Taban ve yüksekliği verilen üçgenin alanını hesaplar.',
    algorithm: `BAŞLA
OKU "Taban uzunluğunu girin" taban
OKU "Yüksekliği girin" yukseklik
alan = (taban * yukseklik) / 2
YAZ "Üçgenin alanı: ", alan
BİTİR`
  },
  {
    id: 'not_ortalama',
    name: 'Not Ortalaması ve Geçme',
    icon: '📝',
    description: '3 ders notunun ortalamasını alıp geçme durumunu belirler.',
    algorithm: `BAŞLA
OKU "1. ders notunu girin" not1
OKU "2. ders notunu girin" not2
OKU "3. ders notunu girin" not3
ortalama = (not1 + not2 + not3) / 3
YAZ "Ortalama: ", ortalama
EĞER ortalama >= 50 İSE
  YAZ "Geçtiniz!"
DEĞİLSE
  YAZ "Kaldınız!"
EĞER_BİTİR
BİTİR`
  },
  {
    id: 'carpim_tablosu',
    name: 'Çarpım Tablosu',
    icon: '✖️',
    description: 'Girilen sayının çarpım tablosunu yazdırır.',
    algorithm: `BAŞLA
OKU sayi
DÖNGÜ i = 1, 10, 1
  sonuc = sayi * i
  YAZ sayi, " x ", i, " = ", sonuc
DÖNGÜ_BİTİR
BİTİR`
  },
  {
    id: 'pozitif_negatif',
    name: 'Pozitif / Negatif / Sıfır',
    icon: '⚖️',
    description: 'Girilen sayının pozitif, negatif veya sıfır olduğunu belirler.',
    algorithm: `BAŞLA
OKU sayi
EĞER sayi > 0 İSE
  YAZ "Pozitif sayı"
DEĞİLSE
  EĞER sayi < 0 İSE
    YAZ "Negatif sayı"
  DEĞİLSE
    YAZ "Sıfır"
  EĞER_BİTİR
EĞER_BİTİR
BİTİR`
  }
];
