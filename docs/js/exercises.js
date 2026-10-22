// Biblioteka ćwiczeń. Każde ćwiczenie ma etapy (stages) do odhaczania; etap jest zaliczony,
// gdy pies spełnia kryterium (goal) — zwykle ok. 8 na 10 udanych powtórzeń w 2 sesjach z rzędu.
// Pola: id, name, cat, lvl (1 łatwe · 2 średnie · 3 trudne), cue (słowo), signal (gest),
// why, stages[{t, d, goal}], tips[], mistakes[], collie (uwaga dla border collie), pre (ćwiczenia wcześniej).

export const CATEGORIES = [
  { id: 'beh', name: 'Od behawiorysty', short: 'Behawiorysta', desc: 'Ćwiczenia z zaleceń — opis to ogólna podpowiedź, ważniejsze są wskazówki z Waszego spotkania.' },
  { id: 'base', name: 'Fundamenty', short: 'Fundamenty', desc: 'Marker, kontakt, target — na tym stoi cała reszta.' },
  { id: 'obed', name: 'Posłuszeństwo', short: 'Posłuszeństwo', desc: 'Komendy na co dzień: w domu, na spacerze, w mieście.' },
  { id: 'calm', name: 'Spokój i samokontrola', short: 'Spokój', desc: 'Wyłącznik, cierpliwość, mijanie bodźców — kluczowe u border collie.' },
  { id: 'trick', name: 'Sztuczki', short: 'Sztuczki', desc: 'Zabawa, kondycja i więź — collie uczą się ich błyskawicznie.' },
  { id: 'brain', name: 'Węch i głowa', short: 'Węch i głowa', desc: 'Praca węchem i zadania umysłowe, które naprawdę męczą.' },
];

export const LEVELS = { 1: 'łatwe', 2: 'średnie', 3: 'trudne' };

const R2 = '8 z 10 udanych w 2 sesjach z rzędu';

export const EXERCISES = [
  // ───────────── OD BEHAWIORYSTKI ─────────────
  {
    id: 'reka', name: 'Karmienie z ręki „za nic”', cat: 'beh', lvl: 1, calm: true, cue: '—', signal: '—',
    why: 'Posiłek podawany spokojnie z ręki, bez komend i bez wymagań. Pies dostaje jedzenie od Was, nie musi niczego „załatwiać” ani pilnować — to obniża napięcie i potrzebę kontrolowania otoczenia, a buduje relację.',
    stages: [
      { t: 'Spokojna ręka', d: 'Na dworze, w spokojnym miejscu (ogród, przed domem). Podawaj karmę po kawałku z otwartej dłoni. Bez komend, bez gadania, bez nakręcania. Ty siedzisz lub stoisz spokojnie.', goal: 'Cały posiłek zjedzony spokojnie z ręki' },
      { t: 'Spokojne tempo', d: 'Jeśli pies skacze, gryzie palce lub się nakręca — zatrzymaj rękę i poczekaj na chwilę spokoju, dopiero wtedy kolejny kawałek.', goal: '3 dni z rzędu spokojnych posiłków' },
      { t: 'Różne miejsca na dworze', d: 'Ten sam spokojny rytuał w kilku miejscach wokół domu. Wciąż bez komend.', goal: 'Spokojnie w 3 miejscach' },
    ],
    tips: ['Kończcie posiłek spokojnie — bez zabawy i ekscytacji na koniec.', 'Jedzenie „za nic” znaczy naprawdę za nic: nie proście o siad przed każdym kęsem.'],
    mistakes: ['Zamienianie posiłku w trening z dużą liczbą komend.', 'Pobudzający głos i ruchy.'],
  },
  {
    id: 'podazanie', name: 'Podążanie za opiekunem', cat: 'beh', lvl: 1, calm: true, cue: '—', signal: '—',
    why: 'Idziesz powoli, a pies sam wybiera, żeby iść za Tobą — i za to dostaje kawałek posiłku. Pies uczy się, że to Wy prowadzicie, a on może odpuścić pilnowanie otoczenia. To nie jest spacer — krótko, w jednym spokojnym miejscu przy domu.',
    stages: [
      { t: 'Kilka kroków', d: 'Na dworze (ogród, podwórko; jeśli trzeba — na długiej lince). Zrób kilka wolnych kroków. Gdy pies jest przy Tobie, podaj kawałek karmy przy nodze. Bez komend.', goal: 'Pies idzie za Tobą kilka kroków' },
      { t: 'Zmiany kierunku', d: 'Spokojnie zmieniaj kierunek. Nagradzaj, gdy pies podąża za zmianą.', goal: 'Podąża przy 3 zmianach kierunku' },
      { t: 'Dłużej i spokojnie', d: 'Kilka minut wolnego chodzenia, nagrody coraz rzadziej, pies wciąż przy Tobie i rozluźniony.', goal: '3 min spokojnego podążania' },
    ],
    tips: ['Tempo spacerowe albo wolniej — to ma uspokajać, nie nakręcać.'],
    mistakes: ['Wołanie i zachęcanie psa — niech sam wybierze, żeby iść za Tobą.'],
  },
  {
    id: 'kenel', name: 'Kenel — spokojny odpoczynek', cat: 'beh', lvl: 1, calm: true, cue: 'Kenel', signal: '—',
    why: 'Kenel to miejsce, gdzie pies naprawdę odpoczywa i nie musi niczego pilnować. Psy nadmiernie kontrolujące otoczenie często w ogóle nie odpoczywają — kenel im w tym pomaga. Czas w kenelu zapisujecie w karcie „Kenel” na ekranie Dziś.',
    stages: [
      { t: 'Kenel to dobre miejsce', d: 'Wygodne posłanie, woda, ewentualnie gryzak. Kenel w spokojnym miejscu domu, można przykryć kocem.', goal: 'Pies sam wchodzi do kenela' },
      { t: 'Zamknięte drzwiczki', d: 'Zamykaj, gdy pies leży spokojnie. Otwieraj, gdy jest cicho — nie wtedy, gdy szczeka lub drapie.', goal: 'Spokojnie przy zamkniętych drzwiczkach' },
      { t: 'Długi odpoczynek', d: 'Kilka dłuższych drzemek w ciągu dnia, razem minimum tyle, ile zalecił behawiorysta.', goal: 'Dzienny limit kenela osiągnięty spokojnie' },
    ],
    tips: ['Wyjścia na siku krótkie i nudne, prosto na trawę i z powrotem.', 'Wypuszczajcie w chwili ciszy.'],
    mistakes: ['Otwieranie, gdy pies szczeka — uczy, że szczekanie otwiera drzwi.'],
  },

  // ───────────── FUNDAMENTY ─────────────
  {
    calm: true, id: 'marker', name: 'Słowo-marker „Tak!”', cat: 'base', lvl: 1, cue: 'Tak!', signal: '—',
    why: 'Marker mówi psu „dokładnie TO zachowanie dostaje nagrodę”. Dzięki niemu pies rozumie, za co płacicie, nawet z odległości. Oboje używajcie tego samego słowa i tego samego tonu.',
    stages: [
      { t: 'Ładowanie markera', d: 'W spokojnym miejscu powiedz „Tak!” i w ciągu 1 sekundy podaj smakołyk. Nic więcej — pies nie musi nic robić. 10–15 powtórzeń.', goal: 'Pies po „Tak!” odwraca głowę do ręki ze smakołykiem' },
      { t: 'Marker w innych pokojach', d: 'To samo w kuchni, przedpokoju, ogrodzie. Mów „Tak!” gdy pies na Ciebie nie patrzy.', goal: 'Natychmiastowa reakcja na „Tak!” w 3 miejscach' },
      { t: 'Marker za zachowanie', d: 'Zaznaczaj „Tak!” spontaniczne dobre zachowania: pies sam usiadł, sam się położył, spojrzał na Ciebie. Zawsze po markerze nagroda.', goal: 'Pies zaczyna „oferować” zachowania' },
      { t: 'Marker zwalniający i „Dobrze”', d: 'Ustalcie: „Tak!” = koniec ćwiczenia i nagroda; „Dobrze” (spokojnie) = nagroda, ale zostań w pozycji. Przydaje się do „zostań”.', goal: 'Pies rozróżnia oba słowa' },
    ],
    tips: ['Najpierw słowo, potem ruch ręki — nie sięgajcie do saszetki przed markerem.', 'Klikier też działa, ale słowo macie zawsze przy sobie.'],
    mistakes: ['Mówienie „Tak!” bez nagrody — marker traci wartość.', 'Każdy z Was używa innego słowa.'],
  },
  {
    calm: true, id: 'imie', name: 'Reakcja na imię', cat: 'base', lvl: 1, cue: '(imię psa)', signal: '—',
    why: 'Imię znaczy „spójrz na mnie, zaraz coś powiem”. To nie jest przywołanie — tylko zwrócenie uwagi.',
    stages: [
      { t: 'Imię w domu', d: 'Pies stoi blisko. Powiedz imię raz, gdy spojrzy — „Tak!” i nagroda.', goal: R2 },
      { t: 'Imię, gdy pies jest zajęty', d: 'Pies węszy lub bawi się zabawką. Imię raz, spojrzenie = nagroda (najlepiej świetna).', goal: R2 },
      { t: 'Imię na spacerze', d: 'Na smyczy, w spokojnym miejscu. Potem w miejscu z lekkimi rozproszeniami.', goal: '8 z 10 na 2 różnych spacerach' },
    ],
    tips: ['Nie powtarzajcie imienia jak mantry — jedno wołanie, potem pomóż (cmoknięcie, krok w tył).'],
    mistakes: ['Używanie imienia, by skarcić psa.'],
  },
  {
    calm: true, id: 'patrz', name: 'Kontakt wzrokowy „Patrz”', cat: 'base', lvl: 1, cue: 'Patrz', signal: 'Palec przy oku',
    why: 'Pies, który patrzy na Was, nie gapi się na rowerzystę, kota czy owce. Dla border collie (skłonnych do „wpatrywania się” w ruch) to podstawa samokontroli.',
    stages: [
      { t: 'Łapanie spojrzenia', d: 'Trzymaj smakołyk w zaciśniętej dłoni z boku. Czekaj — gdy pies przestanie wpatrywać się w rękę i spojrzy Ci w oczy, „Tak!” i nagroda.', goal: R2 },
      { t: 'Dodanie słowa', d: 'Gdy pies już szybko patrzy, mów „Patrz” tuż przed spojrzeniem.', goal: 'Spojrzenie w 1–2 s po komendzie' },
      { t: 'Wydłużanie', d: 'Licz w myślach 2, 3, 5 sekund kontaktu przed markerem. Dodawaj po sekundzie.', goal: '5 sekund kontaktu, 8 z 10' },
      { t: 'Z rozproszeniem', d: 'Ręka ze smakołykiem wyciągnięta w bok, druga osoba przechodzi obok, piłka leży na ziemi.', goal: '3 s kontaktu mimo rozproszenia' },
      { t: 'Na spacerze', d: 'Zawołaj „Patrz” zanim pies zauważy bodziec (np. psa w oddali).', goal: 'Działa na 3 spacerach z rzędu' },
    ],
    tips: ['Nagradzaj z ręki przy swojej twarzy — spojrzenie zostaje „u góry”.'],
    mistakes: ['Wydłużanie czasu za szybko — pies odwraca wzrok i się zniechęca.'],
  },
  {
    calm: true, id: 'dotknij', name: 'Target nosem „Dotknij”', cat: 'base', lvl: 1, cue: 'Dotknij', signal: 'Otwarta dłoń bokiem do psa',
    why: 'Pies dotyka nosem Twojej dłoni. To „pilot” do prowadzenia psa bez smakołyka w ręce: na wagę, obok nogi, przez drzwi, do sztuczek. Collie to uwielbiają.',
    stages: [
      { t: 'Pierwsze dotknięcia', d: 'Pokaż pustą otwartą dłoń 10 cm od nosa. Pies powącha = „Tak!” i nagroda z drugiej ręki. Chowaj dłoń za plecy między powtórzeniami.', goal: R2 },
      { t: 'Ręka w różnych miejscach', d: 'Dłoń wyżej, niżej, z lewej, z prawej, coraz dalej (30–50 cm).', goal: 'Pies podchodzi do dłoni z 50 cm' },
      { t: 'Komenda i ruch', d: 'Mów „Dotknij” i prowadź psa: idzie za dłonią 2–3 kroki, dopiero wtedy dotyka.', goal: 'Pies idzie za dłonią 3 kroki' },
      { t: 'Target na przedmiot', d: 'Przenieś dotykanie na karteczkę samoprzylepną lub pokrywkę. Przyda się do „zamknij drzwi”.', goal: 'Dotyka karteczki na ścianie' },
    ],
    tips: ['Nagradzaj blisko dłoni-celu, żeby pies wracał do niej.'],
    mistakes: ['Wciskanie dłoni w nos psa — to on ma podejść.'],
  },

  // ───────────── POSŁUSZEŃSTWO ─────────────
  {
    calm: true, id: 'siad', name: 'Siad', cat: 'obed', lvl: 1, cue: 'Siad', signal: 'Dłoń wnętrzem do góry, unosi się',
    why: 'Najprostsza „grzeczna” pozycja: zamiast skakania, przed miską, przed przejściem przez ulicę.',
    stages: [
      { t: 'Wabienie', d: 'Smakołyk przy nosie, powoli przesuń nad głową do tyłu. Pupa ląduje — „Tak!”.', goal: R2 },
      { t: 'Gest bez smakołyka', d: 'Ten sam ruch pustą ręką; nagroda z drugiej ręki lub saszetki.', goal: R2 },
      { t: 'Słowo przed gestem', d: 'Powiedz „Siad”, odczekaj sekundę, dopiero potem gest. Z czasem pies siada na samo słowo.', goal: 'Siada na samo słowo 8 z 10' },
      { t: 'Siad w różnych miejscach', d: 'Kuchnia, ogród, chodnik, przy drzwiach, przy innych ludziach.', goal: 'Działa w 5 miejscach' },
      { t: 'Siad z odległości', d: 'Pies 1–2 m przed Tobą, „Siad” bez podchodzenia. Wróć i nagródź w pozycji.', goal: 'Siad z 2 m, 8 z 10' },
    ],
    tips: ['Dorosły collie pewnie zna siad — przejdźcie od razu do etapów 4–5 i zaznaczcie wcześniejsze.'],
    mistakes: ['Powtarzanie „siad, siad, SIAD” — pies uczy się, że pierwsze nie liczy się.', 'Wciskanie zadu ręką.'],
  },
  {
    calm: true, id: 'waruj', name: 'Waruj (leżeć)', cat: 'obed', lvl: 1, cue: 'Waruj', signal: 'Dłoń płasko w dół', pre: ['siad'],
    why: 'Najbardziej stabilna pozycja na dłuższe czekanie: w kawiarni, u weterynarza, w domu przy gościach.',
    stages: [
      { t: 'Wabienie z siadu', d: 'Smakołyk od nosa prosto w dół między przednie łapy, potem lekko do przodu po podłodze. Łokcie na ziemi — „Tak!”.', goal: R2 },
      { t: 'Gest pustą ręką', d: 'Ten sam ruch bez jedzenia w ręce, gest coraz mniejszy (do samej płaskiej dłoni w dół).', goal: R2 },
      { t: 'Słowo', d: '„Waruj”, pauza, gest. Wycofuj gest.', goal: 'Na samo słowo 8 z 10' },
      { t: 'Waruj ze stania', d: 'Pies stoi (nie siedzi) — połóż go bezpośrednio.', goal: R2 },
      { t: 'Waruj w rozproszeniu', d: 'Na trawie, w parku, przy drugiej osobie bawiącej się piłką.', goal: 'Działa w 4 miejscach' },
    ],
    tips: ['Na zimnych płytkach lub mokrej trawie pies może nie chcieć leżeć — zacznijcie na dywanie lub macie.'],
    mistakes: ['Wabienie zbyt daleko do przodu — pies wstaje i idzie.'],
  },
  {
    calm: true, id: 'stoj', name: 'Stój', cat: 'obed', lvl: 2, cue: 'Stój', signal: 'Dłoń odsuwa się od nosa poziomo',
    why: 'Przydaje się przy wycieraniu łap, czesaniu, u weterynarza i w sztuczkach.',
    stages: [
      { t: 'Wabienie z siadu', d: 'Smakołyk przy nosie, odsuń go poziomo do przodu — pies wstaje. „Tak!” gdy stoi na 4 łapach.', goal: R2 },
      { t: 'Gest i słowo', d: 'Pusta ręka, potem słowo przed gestem.', goal: R2 },
      { t: 'Stanie przez chwilę', d: 'Nagradzaj co 1–2 s, gdy stoi. Dotknij łapy, grzbietu — nadal stoi.', goal: '10 s stania z dotykiem' },
    ],
    tips: ['Nagradzaj z ręki tuż przy nosie, nisko — inaczej pies siada.'],
    mistakes: [],
  },
  {
    calm: true, id: 'zostan', name: 'Zostań (3D: czas, odległość, rozproszenie)', cat: 'obed', lvl: 2, cue: 'Zostań', signal: 'Otwarta dłoń jak „stop”', pre: ['siad', 'waruj'],
    why: '„Zostań” = nie ruszaj się, aż zwolnię słowem „Wolne”. Ćwiczy się 3 rzeczy osobno: czas, odległość i rozproszenie — nigdy wszystkie naraz.',
    stages: [
      { t: 'Czas: 5 sekund', d: 'Pies w siadzie/warowaniu, „Zostań”, stój obok. Nagradzaj „Dobrze” w pozycji co 1–2 s, potem „Wolne”.', goal: '5 s, ' + R2 },
      { t: 'Czas: 30 sekund', d: 'Stopniowo wydłużaj przerwy między nagrodami. Ty stoisz blisko.', goal: '30 s bez wstawania' },
      { t: 'Odległość: 1 krok → 3 m', d: 'Czas skróć do kilku sekund! Krok w tył, wróć, nagroda, „Wolne”. Potem 2, 3 kroki, aż do 3 m.', goal: '3 m, 8 z 10' },
      { t: 'Odległość: 10 m i wyjście z pola widzenia', d: 'Krok po kroku dalej, potem na chwilę za róg/drzwi.', goal: '10 m lub 5 s poza wzrokiem' },
      { t: 'Rozproszenie', d: 'Blisko i krótko: podskok, klaśnięcie, upuszczona zabawka, druga osoba przechodzi obok.', goal: '5 różnych rozproszeń zaliczonych' },
      { t: 'Wszystko razem w realu', d: 'Zostań przy otwartych drzwiach, w parku, przy kawiarni. Krótko i z sukcesem.', goal: '1 min w nowym miejscu' },
    ],
    tips: ['Zawsze wracaj do psa i zwalniaj go — nie wołaj z „zostań” (to inne ćwiczenie).', 'Jeśli pies wstaje 2 razy z rzędu, ułatwij (krócej, bliżej).'],
    mistakes: ['Zwiększanie czasu i odległości jednocześnie.', 'Zapominanie o słowie zwalniającym — pies sam decyduje, kiedy koniec.'],
  },
  {
    calm: true, id: 'wolne', name: 'Słowo zwalniające „Wolne”', cat: 'obed', lvl: 1, cue: 'Wolne', signal: 'Dłoń w bok, zachęta',
    why: 'Mówi psu, że ćwiczenie się skończyło. Bez niego „siad” i „zostań” nie mają jasnego końca.',
    stages: [
      { t: 'Wprowadzenie', d: 'Pies w siadzie. Powiedz „Wolne”, zrób krok w bok i zachęć psa do ruszenia. Pochwała.', goal: R2 },
      { t: 'Konsekwencja', d: 'Każde ćwiczenie z pozycją kończcie „Wolne” — oboje!', goal: 'Tydzień konsekwentnego używania' },
    ],
    tips: [],
    mistakes: ['Pies wstaje sam, a Wy mówicie „wolne” po fakcie.'],
  },
  {
    id: 'przywolanie', name: 'Przywołanie „Do mnie”', cat: 'obed', lvl: 2, cue: 'Do mnie', signal: 'Ramiona szeroko / dłoń do klatki', pre: ['imie'],
    why: 'Najważniejsza komenda dla bezpieczeństwa. Border collie mają silny instynkt gonienia ruchu — pewne przywołanie to ich wolność bez smyczy.',
    stages: [
      { t: 'Gra „ping-pong” w domu', d: 'Oboje siedzicie w dwóch końcach pokoju. Na zmianę wołacie „Do mnie”, pies przybiega = jackpot (kilka smakołyków), dotknijcie obroży.', goal: '10 z 10 w domu' },
      { t: 'Ogród / pusty teren na lince', d: 'Długa linka 5–10 m. Wołaj, gdy pies jest lekko zajęty. Uciekaj kilka kroków do tyłu — to go nakręca.', goal: R2 },
      { t: 'Przywołanie od zapachu', d: 'Wołaj, gdy pies węszy. Nagroda super (ser, kiełbaska) + puść z powrotem węszyć („Wolne”) — przywołanie nie kończy zabawy.', goal: '8 z 10 na lince' },
      { t: 'Przywołanie od zabawy z psem / od ruchu', d: 'Na lince: druga osoba rzuca piłkę lub biegnie. Zacznij, gdy bodziec jest daleko.', goal: '8 z 10 na lince' },
      { t: 'Gwizdek (opcjonalnie)', d: 'Załaduj gwizdek jak marker: gwizdek → jackpot. Niesie się dalej niż głos i brzmi tak samo u Was obojga.', goal: 'Natychmiastowy powrót na gwizdek' },
      { t: 'Bez linki w bezpiecznym miejscu', d: 'Dopiero gdy na lince jest 9/10. Ogrodzony wybieg, potem łąka.', goal: '3 spacery bez wpadki' },
    ],
    tips: ['Nigdy nie wołajcie psa na rzeczy nieprzyjemne (kąpiel, koniec spaceru) — wtedy podejdźcie po niego.', 'Ustalcie jedno słowo. „Chodź”, „do mnie”, „tutaj” to dla psa 3 różne rzeczy.'],
    mistakes: ['Wołanie kilka razy, gdy pies nie reaguje — „zatruwa” komendę. Lepiej podejść.', 'Karanie psa, który w końcu przyszedł.'],
    collie: 'Collie mogą próbować „okrążać” zamiast przybiec prosto — nagradzajcie przy samej nodze, za przyjście na wprost.',
  },
  {
    id: 'smycz', name: 'Chodzenie na luźnej smyczy', cat: 'obed', lvl: 2, cue: '(brak — luźna smycz to zasada)', signal: '—',
    why: 'Spacer bez ciągnięcia. Pies uczy się, że luźna smycz = idziemy dalej, napięta = stoimy.',
    stages: [
      { t: 'Nagroda przy nodze w domu', d: 'Idź po mieszkaniu bez smyczy. Za każdym razem, gdy pies jest przy Twojej nodze (lewej lub prawej — ustalcie razem!), „Tak!” i smakołyk przy szwie spodni.', goal: '20 kroków z psem przy nodze' },
      { t: 'Smycz w domu i ogrodzie', d: 'To samo na smyczy. Nagradzaj często — co 2–3 kroki.', goal: '30 kroków luźnej smyczy' },
      { t: 'Stop przy napięciu', d: 'Na spacerze: smycz się napina → zatrzymaj się. Pies się odwraca/luzuje → „Tak!”, idziecie dalej.', goal: 'Pies sam luzuje smycz w 3 s' },
      { t: 'Zmiany kierunku', d: 'Gdy pies wyprzedza, spokojnie zawróć. Nagradzaj, gdy dogania przy nodze.', goal: '5 min spaceru bez ciągnięcia' },
      { t: 'Przy rozproszeniach', d: 'Mijanie psów, ludzi, rowerów. Więcej nagród, większy dystans od bodźca.', goal: 'Cały krótki spacer luźno' },
    ],
    tips: ['Pozwalajcie na „przerwy węchowe” na słowo „Wąchaj” — spacer to też czas psa.', 'Szelki zamiast obroży przy ciągnięciu.'],
    mistakes: ['Raz pozwalamy ciągnąć, raz nie — pies uczy się, że ciągnięcie czasem działa.', 'Oboje uczycie innej strony.'],
  },
  {
    id: 'noga', name: 'Przy nodze (precyzyjne)', cat: 'obed', lvl: 3, cue: 'Noga', signal: 'Dłoń klepie udo', pre: ['dotknij', 'smycz'],
    why: 'Formalne chodzenie z psem przy kolanie, z uwagą na przewodniku — w tłumie, przy przejściu przez ulicę, obok rowerów.',
    stages: [
      { t: 'Pozycja przy nodze w miejscu', d: 'Wabikiem lub targetem ustaw psa przy lewej nodze, ramię psa przy kolanie. „Tak!”, nagroda przy nodze.', goal: R2 },
      { t: 'Wejście do pozycji', d: 'Pies stoi przed Tobą — prowadź dłonią tak, by obszedł/obrócił się do nogi.', goal: 'Wchodzi do pozycji na słowo 8 z 10' },
      { t: '3–5 kroków', d: '„Noga”, kilka kroków, nagroda co 1–2 kroki przy nodze.', goal: '5 kroków z uwagą' },
      { t: 'Zwroty i zmiany tempa', d: 'Zwrot w lewo, w prawo, wolniej, szybciej, zatrzymanie (pies siada).', goal: '20 kroków z 2 zwrotami' },
      { t: 'W rozproszeniu', d: 'Krótkie odcinki „noga” na spacerze, potem nagroda i luźna smycz.', goal: '20 kroków przy rowerzyście/psie' },
    ],
    tips: ['To ćwiczenie męczące mentalnie — krótkie odcinki, dużo nagród.'],
    mistakes: ['Wymaganie „nogi” przez cały spacer.'],
  },
  {
    id: 'zostaw', name: 'Zostaw', cat: 'obed', lvl: 2, cue: 'Zostaw', signal: 'Dłoń zasłania jak tarcza',
    why: 'Pies odpuszcza coś, czego chce: jedzenie na ulicy, kanapkę na stole, kota, kupę. Może uratować życie.',
    stages: [
      { t: 'Zaciśnięta pięść', d: 'Smakołyk w zamkniętej dłoni. Pies liże, trąca — czekaj. Gdy się odsunie choć na chwilę, „Tak!” i nagroda z DRUGIEJ ręki.', goal: R2 },
      { t: 'Otwarta dłoń', d: 'Smakołyk na otwartej dłoni; gdy pies sięga, zamknij. Odsuwa się → nagroda z drugiej ręki.', goal: R2 },
      { t: 'Słowo i podłoga', d: '„Zostaw”, smakołyk na podłodze, nakryj stopą, gdy pies sięga. Odpuszcza → nagroda.', goal: 'Pies nie rusza smakołyka na podłodze przez 5 s' },
      { t: 'Przechodzenie obok', d: 'Na smyczy przejdź obok leżącego smakołyka (smycz krótka, żeby nie sięgnął).', goal: '5 przejść bez sięgania' },
      { t: 'Zostaw w ruchu i zabawki', d: 'Zostaw rzuconą piłkę, toczący się smakołyk, kawałek jedzenia na spacerze (podłożony).', goal: '8 z 10' },
    ],
    tips: ['Nagroda nigdy nie jest tą rzeczą, którą pies ma zostawić — zawsze z innej ręki.'],
    mistakes: ['Krzyczenie „zostaw” — to spokojna, pewna komenda.'],
  },
  {
    id: 'oddaj', name: 'Oddaj / Puść', cat: 'obed', lvl: 2, cue: 'Puść', signal: 'Otwarta dłoń pod pyskiem',
    why: 'Pies oddaje to, co ma w pysku: zabawkę, skarpetkę, znalezisko. Przy zabawie piłką collie często nie chcą oddawać — to zmienia wszystko.',
    stages: [
      { t: 'Wymiana na smakołyk', d: 'Pies trzyma zabawkę. Smakołyk przy nosie — puszcza → „Tak!”, smakołyk, zabawka wraca do psa.', goal: R2 },
      { t: 'Słowo przed smakołykiem', d: '„Puść”, odczekaj sekundę, dopiero potem pokaż smakołyk.', goal: 'Puszcza na słowo 8 z 10' },
      { t: 'Zabawka za zabawkę', d: 'Nagrodą jest dalsza zabawa: puszcza → od razu rzucasz piłkę ponownie / druga zabawka.', goal: 'Płynna gra z oddawaniem' },
      { t: 'Wysoka wartość', d: 'Oddanie gryzaka, kości lub „skarbu” za super nagrodę.', goal: 'Oddaje gryzak bez warczenia' },
    ],
    tips: ['Jeśli pies warczy przy oddawaniu rzeczy (pilnowanie zasobów), nie siłujcie się — zgłoście to w szczegółach, dobierzemy plan.'],
    mistakes: ['Gonienie psa, który ma zabawkę — robi się z tego zabawa w berka.', 'Szarpanie zabawki z pyska.'],
  },
  {
    calm: true, id: 'czekaj', name: 'Czekaj (drzwi, miska, auto)', cat: 'obed', lvl: 2, cue: 'Czekaj', signal: 'Dłoń „stop”', pre: ['wolne'],
    why: 'Krótka pauza przed czymś fajnym. Pies nie wybiega przez drzwi ani z auta i nie rzuca się na miskę.',
    stages: [
      { t: 'Miska', d: 'Opuść miskę. Pies rusza → miska w górę. Pies czeka chwilę → „Wolne”, może jeść.', goal: '3 s czekania na miskę' },
      { t: 'Drzwi wewnętrzne', d: 'Uchyl drzwi. Pies rusza → zamknij. Czeka → „Wolne”, przechodzi.', goal: R2 },
      { t: 'Drzwi wejściowe i furtka', d: 'Na smyczy (bezpieczeństwo!). Otwieraj szerzej, wychodź pierwszy.', goal: 'Czeka przy otwartych drzwiach 5 s' },
      { t: 'Bagażnik / auto', d: 'Otwierasz bagażnik, pies czeka na „Wolne” (najpierw przypnij smycz).', goal: '8 z 10' },
    ],
    tips: ['„Czekaj” jest krótsze i luźniejsze niż „zostań” — pies może zmienić pozycję, byle nie ruszał naprzód.'],
    mistakes: [],
  },
  {
    calm: true, id: 'mata', name: 'Na miejsce (mata)', cat: 'obed', lvl: 2, cue: 'Miejsce', signal: 'Wskazanie palcem na matę', pre: ['waruj'],
    why: 'Pies idzie na swoją matę i leży tam, aż go zwolnicie. Idealne przy jedzeniu, gościach, sprzątaniu.',
    stages: [
      { t: 'Mata = smakołyki', d: 'Połóż matę. Każdy krok/łapa na macie → „Tak!”, smakołyk rzucony NA matę.', goal: 'Pies sam wchodzi na matę' },
      { t: 'Waruj na macie', d: 'Nagradzaj tylko za położenie się na macie.', goal: R2 },
      { t: 'Wysyłanie z odległości', d: '„Miejsce” z 1 m, potem 2, 3 m, z innego kąta pokoju.', goal: 'Idzie z 3 m, 8 z 10' },
      { t: 'Zostawanie na macie', d: 'Czas: nagradzaj co kilka sekund leżenia, potem rzadziej. Ty się krzątasz.', goal: '5 min na macie' },
      { t: 'Mata przy dzwonku i gościach', d: 'Dzwonek → „Miejsce”. Najpierw na udawany dzwonek (nagranie).', goal: 'Leży, gdy gość wchodzi' },
    ],
    tips: ['Mata zabierana na wyjazdy i do kawiarni działa jak „przenośny dom”.'],
    mistakes: ['Odsyłanie psa na matę za karę.'],
  },
  {
    id: 'stop', name: 'Awaryjne „Padnij” na odległość', cat: 'obed', lvl: 3, cue: 'Padnij', signal: 'Ręka w górę', pre: ['waruj', 'zostan'],
    why: 'Pies kładzie się natychmiast, nawet w biegu i daleko od Was — np. gdy biegnie w stronę ulicy. Dla collie, które ruszają za ruchem, bezcenne.',
    stages: [
      { t: 'Szybkie waruj obok', d: 'Waruj jak najszybciej — nagradzaj tylko szybkie położenie (rzucony smakołyk za psa).', goal: 'Leży w < 1 s' },
      { t: 'Waruj z odległości 2–3 m', d: 'Pies przed Tobą, „Padnij” bez ruszania się z miejsca.', goal: R2 },
      { t: 'Waruj w ruchu', d: 'Pies idzie obok / wolno idzie do Ciebie — „Padnij”.', goal: '8 z 10' },
      { t: 'Waruj w biegu', d: 'Pies biegnie do rzuconej zabawki — „Padnij”, potem nagroda: zabawka!', goal: '8 z 10 na lince' },
    ],
    tips: ['Używajcie tego słowa tylko do ćwiczeń i sytuacji awaryjnych.'],
    mistakes: ['Ćwiczenie przy zmęczonym psie.'],
  },

  // ───────────── SPOKÓJ I SAMOKONTROLA ─────────────
  {
    calm: true, id: 'relaks', name: 'Relaks na macie (wyciszenie)', cat: 'calm', lvl: 2, cue: 'Odpocznij', signal: '—', pre: ['mata'],
    why: 'Border collie rzadko same „wyłączają się” — trzeba je tego nauczyć. Nagradzamy spokój: rozluźnienie, westchnienie, położenie głowy.',
    stages: [
      { t: 'Spokój za spokój', d: 'Siedzisz na kanapie, pies na macie. Spokojnie kładziesz smakołyk między łapy, gdy leży spokojnie. Bez markera, bez ekscytacji.', goal: '5 min spokojnego leżenia' },
      { t: 'Oznaki rozluźnienia', d: 'Nagradzaj przetoczenie na biodro, głowę na łapach, westchnienie.', goal: 'Pies sam kładzie głowę' },
      { t: 'Relaks w innych miejscach', d: 'Mata w ogrodzie, na balkonie, w aucie, u znajomych.', goal: '10 min w nowym miejscu' },
      { t: 'Relaks po zabawie', d: 'Po 5 min zabawy — mata i wyciszenie. Uczy przełączania z „ON” na „OFF”.', goal: 'Uspokaja się w 2 min po zabawie' },
    ],
    tips: ['Używajcie gryzaka lub maty do lizania — lizanie i żucie naturalnie uspokajają.', 'Mów cicho, ruszaj się wolno.'],
    mistakes: ['Ciągłe „nakręcanie” psa — zmęczony fizycznie collie nie jest spokojnym collie.'],
    collie: 'Collie „przeładowane” bodźcami (ciągłe rzucanie piłki) bywają bardziej pobudzone, nie mniej. Wyciszanie to ćwiczenie, nie kara.',
  },
  {
    id: 'onoff', name: 'Włącz/wyłącz zabawę', cat: 'calm', lvl: 2, cue: 'Koniec', signal: 'Dłonie w dół, rozłożone', pre: ['oddaj'],
    why: 'Pies uczy się szybko przełączać z ekscytacji w spokój i z powrotem. Mniej skakania, gryzienia rękawów i „nakręcania się”.',
    stages: [
      { t: 'Krótka szarpanka i przerwa', d: 'Szarpak 5 s → „Puść” → spokojny siad 2 s → „Weź!” i znowu zabawa. Przerwa jest nagradzana powrotem zabawy.', goal: 'Siad w przerwie 8 z 10' },
      { t: 'Coraz dłuższe przerwy', d: 'Przerwa 5, 10, 20 s. Pies sam proponuje spokój.', goal: '20 s spokoju w przerwie' },
      { t: 'Zakończenie zabawy', d: '„Koniec”, zabawka znika, rzucasz kilka smakołyków na trawę do wyszukania (węszenie wycisza).', goal: 'Pies nie domaga się dalej' },
    ],
    tips: [], mistakes: ['Kończenie zabawy dopiero, gdy pies jest „w amoku”.'],
  },
  {
    id: 'mijanie', name: 'Mijanie bodźców (rowery, auta, biegacze)', cat: 'calm', lvl: 3, cue: 'Patrz / Zostaw', signal: '—', pre: ['patrz', 'zostaw'],
    why: 'Instynkt pasterski = chęć zaganiania i gonienia ruchu. Uczymy psa, że rower lub biegacz to sygnał, by spojrzeć na przewodnika — a nie by rzucić się w pogoń.',
    stages: [
      { t: 'Znajdź bezpieczny dystans', d: 'Stańcie tak daleko od drogi/ścieżki, by pies widział ruch, ale mógł jeść i reagować. Zapiszcie ten dystans w notatce.', goal: 'Pies je smakołyki, widząc ruch' },
      { t: 'Gra „Spójrz na to”', d: 'Pies spojrzy na rower → „Tak!” → nagroda. Pies uczy się: rower = patrzę na rower i odwracam się do Was.', goal: 'Pies sam odwraca się po spojrzeniu' },
      { t: 'Zmniejszanie dystansu', d: 'Co kilka sesji o kilka metrów bliżej. Gdy pies się usztywnia, „pełznie” lub szczeka — za blisko, cofnijcie się.', goal: 'Spokój o połowę bliżej niż na starcie' },
      { t: 'Mijanie w ruchu', d: 'Spacer wzdłuż ścieżki rowerowej: „Patrz” zanim rower minie, luźna smycz.', goal: '5 mijanek bez skoku' },
    ],
    tips: ['Ruchliwe miejsca to trudny poziom — na początku spokojna ulica.', 'Zapisujcie w notatkach sesji, co było wyzwalaczem — wspólnie zobaczycie wzorce.'],
    mistakes: ['Ćwiczenie zbyt blisko — pies jest „nad progiem” i nie jest w stanie się uczyć.'],
    collie: 'Kładzenie się, „wbicie wzroku” i skradanie to naturalne pasterskie zachowania — przerywajcie je zanim przejdą w sprint.',
  },
  {
    id: 'powitanie', name: 'Spokojne powitanie (bez skakania)', cat: 'calm', lvl: 2, cue: 'Siad', signal: '—', pre: ['siad'],
    why: 'Uwagę dostaje się na czterech łapach. Uczy psa, jak witać Was i gości.',
    stages: [
      { t: 'Wejście do domu', d: 'Wchodzisz — pies skacze → odwróć się bokiem, bez słów. Cztery łapy na ziemi → spokojne powitanie i smakołyk nisko.', goal: 'Witanie bez skoku przez 3 dni' },
      { t: 'Siad do głaskania', d: 'Pies siada → głaskanie. Wstaje i skacze → głaskanie się kończy.', goal: '8 z 10' },
      { t: 'Goście', d: 'Pies na smyczy lub na macie. Gość ignoruje psa, aż ten się uspokoi.', goal: 'Spokojne powitanie gościa' },
    ],
    tips: ['Oboje — i goście — muszą robić to samo, inaczej skakanie zostanie nagrodzone.'],
    mistakes: [],
  },
  {
    id: 'pilka', name: 'Cierpliwość przy piłce', cat: 'calm', lvl: 2, cue: 'Czekaj', signal: '—', pre: ['czekaj'],
    why: 'Wiele border collie ma obsesję piłki. Uczymy, że piłka leci tylko gdy pies jest spokojny — zabawa jest nagrodą za samokontrolę.',
    stages: [
      { t: 'Piłka w górze', d: 'Trzymasz piłkę. Pies skacze/szczeka → nic. Siada spokojnie → rzut.', goal: 'Siad przed każdym rzutem' },
      { t: 'Czekaj po rzucie', d: 'Rzucasz, pies czeka na „Weź!” (najpierw na smyczy). Krótko!', goal: '2 s czekania, 8 z 10' },
      { t: 'Limit rzutów', d: 'Ustalcie limit (np. 10 rzutów), potem „Koniec” i węszenie.', goal: 'Pies przyjmuje koniec spokojnie' },
    ],
    tips: ['Zamiast 50 rzutów — 10 rzutów + 5 minut zadań węchowych.'],
    mistakes: ['Rzucanie piłki „żeby się zmęczył” bez końca.'],
    collie: 'Obsesyjne gonienie piłki i cieni to częsty problem u collie — jeśli pies nie potrafi przestać, dopiszcie to w szczegółach.',
  },
  {
    calm: true, id: 'samotnosc', name: 'Zostawanie samemu w domu', cat: 'calm', lvl: 2, cue: 'Pilnuj domu', signal: '—',
    why: 'Pies uczy się, że Wasze wyjście jest nudne i przewidywalne. Zapobiega niszczeniu, wyciu i stresowi.',
    stages: [
      { t: 'Wyjścia w domu', d: 'Wychodź do innego pokoju na 10 s, wracaj spokojnie. Bez pożegnań.', goal: 'Pies nie idzie za Tobą' },
      { t: 'Rytuał wyjścia bez wyjścia', d: 'Bierz klucze, zakładaj buty — i siadasz. Rytuał traci moc.', goal: 'Brak reakcji na klucze' },
      { t: 'Krótkie wyjścia', d: 'Zajęcie (Kong, mata do lizania) i wyjście na 1, 5, 15 min.', goal: '15 min spokoju' },
      { t: 'Dłuższe nieobecności', d: 'Stopniowo wydłużajcie. Nagrajcie psa kamerką — zobaczycie, co robi.', goal: '1–2 h spokoju' },
    ],
    tips: ['Przed dłuższym wyjściem: spacer z węszeniem + krótki trening.'],
    mistakes: ['Wylewne pożegnania i powitania.'],
  },

  // ───────────── SZTUCZKI ─────────────
  {
    calm: true, id: 'lapa', name: 'Łapa / Druga łapa', cat: 'trick', lvl: 1, cue: 'Łapa / Druga', signal: 'Otwarta dłoń przy łapie',
    why: 'Klasyk. Przydaje się też przy obcinaniu pazurów i wycieraniu łap.',
    stages: [
      { t: 'Łapa na pięść', d: 'Smakołyk w pięści nisko przy łapie. Pies drapie pięść → „Tak!”.', goal: R2 },
      { t: 'Łapa na otwartą dłoń', d: 'Pokaż otwartą dłoń, nagradzaj położenie łapy na dłoni.', goal: R2 },
      { t: 'Druga łapa', d: 'Nagradzaj tylko drugą łapę (dłoń po drugiej stronie). Osobne słowo.', goal: 'Rozróżnia łapy 8 z 10' },
    ],
    tips: [], mistakes: [],
  },
  {
    calm: true, id: 'piatka', name: 'Przybij piątkę', cat: 'trick', lvl: 1, cue: 'Piątka', signal: 'Dłoń w górze', pre: ['lapa'],
    why: 'Łapa w górę na wysokość Twojej dłoni — szybkie przejście z „łapy”.',
    stages: [
      { t: 'Wyżej niż łapa', d: 'Dłoń z „łapy” podnoś stopniowo i obracaj pionowo.', goal: 'Uderza w pionową dłoń' },
      { t: 'Nowe słowo', d: '„Piątka” przed gestem.', goal: R2 },
      { t: 'Dziesiątka', d: 'Obie łapy w obie dłonie (pies podskakuje lub siada wysoko).', goal: '5 udanych' },
    ],
    tips: [], mistakes: [],
  },
  {
    id: 'obrot', name: 'Kręć (obrót w prawo i w lewo)', cat: 'trick', lvl: 1, cue: 'Kręć / Hop', signal: 'Kółko palcem',
    why: 'Szybka sztuczka, rozgrzewka przed treningiem, rozciąga kręgosłup — ćwiczcie oba kierunki.',
    stages: [
      { t: 'Wabienie w kółko', d: 'Smakołyk przy nosie, prowadź dużym kołem. „Tak!” po pełnym obrocie.', goal: R2 },
      { t: 'Mniejszy gest', d: 'Pusta ręka, coraz mniejsze kółko.', goal: 'Obrót na mały gest' },
      { t: 'Drugi kierunek', d: 'To samo w drugą stronę, z innym słowem (np. „Kręć” i „Hop”).', goal: 'Oba kierunki na słowo' },
    ],
    tips: [], mistakes: ['Ćwiczenie tylko jednej strony.'],
  },
  {
    id: 'turlaj', name: 'Turlaj się', cat: 'trick', lvl: 2, cue: 'Turlaj', signal: 'Ręką zatocz koło nad ziemią', pre: ['waruj'],
    why: 'Pies przetacza się na bok, plecy i drugi bok. Dobra sztuczka „na pokaz”.',
    stages: [
      { t: 'Na biodro', d: 'Z warowania smakołyk od nosa w stronę łopatki — pies przewala się na biodro.', goal: R2 },
      { t: 'Na plecy', d: 'Prowadź dalej, za łopatkę — pies kładzie się na boku/plecach.', goal: R2 },
      { t: 'Pełny obrót', d: 'Kontynuuj ruch — pies przetacza się całkiem. Ogromna nagroda.', goal: '5 pełnych obrotów' },
      { t: 'Gest i słowo', d: 'Mniejszy gest, słowo przed nim.', goal: 'Na słowo 8 z 10' },
    ],
    tips: ['Na miękkim podłożu — dywan, trawa.'], mistakes: [],
  },
  {
    id: 'bang', name: 'Bang! (zdechł pies)', cat: 'trick', lvl: 2, cue: 'Bang!', signal: 'Palec jak pistolet', pre: ['turlaj'],
    why: 'Pies pada na bok i nieruchomieje. Efektowne i ćwiczy kontrolę.',
    stages: [
      { t: 'Leżenie na boku', d: 'Jak „turlaj”, ale zatrzymaj na boku. Nagradzaj w pozycji.', goal: '3 s na boku' },
      { t: 'Głowa w dół', d: 'Nagradzaj, gdy pies kładzie głowę na podłodze.', goal: '3 s nieruchomo' },
      { t: 'Ze stania / z siadu', d: 'Pies pada z siadu, potem ze stania.', goal: 'Ze stania 8 z 10' },
      { t: 'Słowo i gest', d: 'Palec-pistolet, „Bang!”.', goal: 'Na „Bang!”' },
    ],
    tips: [], mistakes: [],
  },
  {
    calm: true, id: 'uklon', name: 'Ukłon', cat: 'trick', lvl: 2, cue: 'Ukłon', signal: 'Dłoń w dół przed sobą',
    why: 'Przód w dół, pupa w górze — świetne rozciąganie przed bieganiem.',
    stages: [
      { t: 'Wabienie ze stania', d: 'Pies stoi. Smakołyk od nosa w dół między łapy. Łokcie w dół, pupa w górze → „Tak!”. Gdy pies się kładzie, podłóż dłoń pod brzuch.', goal: R2 },
      { t: 'Przytrzymanie', d: 'Nagradzaj po 1–2 s w ukłonie.', goal: '2 s ukłonu' },
      { t: 'Słowo', d: 'Słowo przed gestem, mniejszy gest.', goal: 'Na słowo 8 z 10' },
    ],
    tips: ['Łapcie też naturalne ukłony po przebudzeniu — „Tak!” i nagroda.'], mistakes: [],
  },
  {
    id: 'slalom', name: 'Slalom między nogami', cat: 'trick', lvl: 2, cue: 'Slalom', signal: '—',
    why: 'Pies przeplata się między Twoimi nogami, gdy idziesz. Uczy koordynacji i świetnie bawi collie.',
    stages: [
      { t: 'Ósemka w miejscu', d: 'Rozstaw nogi. Smakołyk prowadzi psa pod jedną nogą, wokół, pod drugą.', goal: 'Płynna ósemka' },
      { t: 'Z krokiem', d: 'Krok do przodu — pies przechodzi pod nogą wysuniętą. Krok drugą nogą — znów.', goal: '4 kroki slalomu' },
      { t: 'Bez wabika', d: 'Ręka tylko wskazuje, nagroda po kilku przejściach.', goal: '6 kroków na słowo' },
    ],
    tips: [], mistakes: [],
  },
  {
    calm: true, id: 'cofanie', name: 'Cofanie', cat: 'trick', lvl: 2, cue: 'Cofnij', signal: 'Dłoń pcha powietrze do psa',
    why: 'Świadomość tylnych łap — collie zwykle słabo o nich „wiedzą”. Przydaje się w wąskich przejściach.',
    stages: [
      { t: 'Korytarz', d: 'W wąskim przejściu (np. między kanapą a ścianą) idziesz w stronę psa. Krok w tył → „Tak!”, nagroda rzucona za psa.', goal: '1 krok w tył 8 z 10' },
      { t: 'Kilka kroków', d: 'Nagradzaj za 2, 3, 5 kroków.', goal: '5 kroków' },
      { t: 'Bez korytarza', d: 'Na otwartej przestrzeni, Ty stoisz w miejscu.', goal: '3 kroki na słowo' },
    ],
    tips: [], mistakes: ['Pies cofa się krzywo — wróćcie do korytarza.'],
  },
  {
    id: 'prosi', name: 'Prosi (siad wysoki)', cat: 'trick', lvl: 2, cue: 'Proś', signal: 'Dłoń unosi się nad głową', pre: ['siad'],
    why: 'Pies siedzi na tylnych łapach z przednimi w górze. Wzmacnia mięśnie brzucha i grzbietu — ćwiczcie krótko.',
    stages: [
      { t: 'Podniesienie przednich łap', d: 'Z siadu smakołyk w górę nad głową. Łapy odrywają się → „Tak!”.', goal: R2 },
      { t: 'Równowaga', d: 'Pomóż ręką pod klatką. Nagradzaj 1–2 s balansu.', goal: '2 s bez podpory' },
      { t: 'Słowo', d: 'Słowo i mały gest.', goal: '3 s na słowo' },
    ],
    tips: ['Max kilka powtórzeń dziennie na początku — to wysiłek dla mięśni.'], mistakes: [],
  },
  {
    id: 'skok', name: 'Skok przez obręcz / ramiona', cat: 'trick', lvl: 2, cue: 'Hop', signal: 'Wskazanie',
    why: 'Collie kochają skakać. Uczymy skoku kontrolowanego, na niskiej wysokości (stawy!).',
    stages: [
      { t: 'Przejście przez obręcz na ziemi', d: 'Obręcz opiera się o podłogę. Wabik po drugiej stronie, pies przechodzi.', goal: R2 },
      { t: 'Niski skok', d: 'Obręcz 10–20 cm nad ziemią.', goal: '8 z 10' },
      { t: 'Ramiona', d: 'Zamiast obręczy — Twoje ramiona w kółko lub noga oparta o ścianę.', goal: '5 skoków na słowo' },
    ],
    tips: ['Lądowanie na miękkim, nie wyżej niż do łokcia psa.'], mistakes: [],
  },
  {
    id: 'drzwi', name: 'Zamknij drzwi / szufladę', cat: 'trick', lvl: 3, cue: 'Zamknij', signal: 'Wskazanie', pre: ['dotknij'],
    why: 'Pies przenosi target nosem lub łapą na drzwi. Praktyczne i robi wrażenie.',
    stages: [
      { t: 'Target na drzwiach', d: 'Karteczka na drzwiach (prawie zamkniętych). Pies dotyka → „Tak!”.', goal: R2 },
      { t: 'Mocniejsze pchnięcie', d: 'Nagradzaj tylko dotknięcia, które przesuwają drzwi.', goal: 'Zamyka uchylone drzwi' },
      { t: 'Szerzej otwarte', d: 'Drzwi coraz bardziej otwarte, karteczka coraz mniejsza i znika.', goal: 'Zamyka szeroko otwarte' },
      { t: 'Słowo i szuflady', d: '„Zamknij” — drzwi, szafka, szuflada.', goal: 'Na słowo 8 z 10' },
    ],
    tips: [], mistakes: [],
  },
  {
    id: 'sprzatanie', name: 'Sprzątanie zabawek do kosza', cat: 'trick', lvl: 3, cue: 'Sprzątaj', signal: 'Wskazanie kosza', pre: ['oddaj', 'aport'],
    why: 'Łańcuch zachowań: weź → przynieś → puść nad koszem. Idealne zadanie dla mądrej głowy collie.',
    stages: [
      { t: 'Puść nad koszem', d: 'Pies trzyma zabawkę, Twoja ręka nad koszem. „Puść” — zabawka wpada → jackpot.', goal: R2 },
      { t: 'Przynieś do kosza', d: 'Zabawka 1 m od kosza. Pies bierze, podchodzi, puszcza.', goal: '8 z 10' },
      { t: 'Kilka zabawek', d: '2, 3, potem 5 zabawek, nagroda po wszystkich.', goal: '5 zabawek' },
    ],
    tips: [], mistakes: [],
  },
  {
    id: 'nazwy', name: 'Nazwy zabawek', cat: 'trick', lvl: 3, cue: 'Przynieś [nazwa]', signal: '—', pre: ['aport'],
    why: 'Border collie potrafią zapamiętać dziesiątki nazw przedmiotów (słynny Chaser znał ich ponad 1000!). Wielkie zmęczenie umysłowe.',
    stages: [
      { t: 'Jedna nazwa', d: 'Bawiąc się jedną zabawką, często powtarzaj jej nazwę („Miś!”).', goal: 'Przynosi „Misia” bez innych zabawek' },
      { t: 'Wybór z dwóch', d: 'Miś + nieznana zabawka. „Przynieś Misia” — nagradzaj tylko misia.', goal: '8 z 10 wyborów' },
      { t: 'Druga nazwa', d: 'Naucz nowej zabawki (np. „Kaczka”). Potem wybór z dwóch nazwanych.', goal: 'Rozróżnia 2 nazwy' },
      { t: 'Kolekcja', d: 'Kolejne nazwy, wybór z 3–5 zabawek.', goal: '5 nazw' },
    ],
    tips: ['Zapiszcie nazwy zabawek w słowniczku — oboje musicie mówić tak samo.'], mistakes: [],
    collie: 'To jedno z najlepszych „męczących” ćwiczeń dla border collie.',
  },
  {
    calm: true, id: 'wstyd', name: 'Wstydzi się (łapa na nos)', cat: 'trick', lvl: 3, cue: 'Wstyd', signal: 'Dłoń na twarzy',
    why: 'Pies zakrywa łapą pyszczek. Wymaga precyzji i cierpliwości.',
    stages: [
      { t: 'Karteczka na nosie', d: 'Delikatnie przyklej mały kawałek taśmy malarskiej na kufę. Ruch łapy w stronę nosa → „Tak!”.', goal: 'Łapa do nosa 8 z 10' },
      { t: 'Bez taśmy', d: 'Tylko gest i słowo, nagradzaj ruch łapy.', goal: R2 },
      { t: 'Przytrzymanie', d: 'Łapa zostaje na kufie 1–2 s.', goal: '2 s' },
    ],
    tips: [], mistakes: [],
  },
  {
    id: 'dookola', name: 'Dookoła (okrążanie pachołka)', cat: 'trick', lvl: 2, cue: 'Dookoła', signal: 'Wskazanie pachołka',
    why: 'Pies obiega przedmiot i wraca. Bardzo „pasterskie” ćwiczenie — collie robi to naturalnie, a uczy się pracy z odległości.',
    stages: [
      { t: 'Wabienie wokół', d: 'Pachołek/wiadro blisko Ciebie. Smakołyk prowadzi psa dookoła.', goal: 'Pełne okrążenie' },
      { t: 'Wysyłanie', d: 'Ty o krok od pachołka, wskazanie ręką. Nagroda po powrocie.', goal: '8 z 10 z 1 m' },
      { t: 'Odległość', d: '2, 3, 5 m do pachołka.', goal: 'Z 5 m na słowo' },
      { t: 'Kierunki', d: 'Osobne słowa na obieganie w prawo i w lewo (jak u psów pasterskich „come bye” / „away”).', goal: 'Oba kierunki na słowo' },
    ],
    tips: [], mistakes: [],
  },

  // ───────────── WĘCH I GŁOWA ─────────────
  {
    id: 'aport', name: 'Aport z oddaniem do ręki', cat: 'brain', lvl: 2, cue: 'Aport', signal: 'Rzut / wskazanie', pre: ['oddaj'],
    why: 'Pełny aport: biegnie, bierze, wraca prosto, oddaje do ręki. Podstawa frisbee, sprzątania i nazw zabawek.',
    stages: [
      { t: 'Branie do pyska', d: 'Nagradzaj każde wzięcie zabawki do pyska z ręki.', goal: R2 },
      { t: 'Przytrzymanie', d: 'Nagradzaj po 1–2 s trzymania (dłoń pod pyskiem).', goal: '2 s trzymania' },
      { t: 'Przyniesienie z 1–2 m', d: 'Zabawka położona blisko, pies przynosi do ręki.', goal: '8 z 10' },
      { t: 'Rzucony aport', d: 'Rzut, powrót na wprost, oddanie do ręki.', goal: '8 z 10' },
      { t: 'Aport w terenie', d: 'Na łące, w wysokiej trawie, przy rozproszeniach.', goal: '5 czystych aportów' },
    ],
    tips: [], mistakes: ['Pies przynosi i ucieka — wróćcie do etapu „oddaj” i biegajcie do tyłu.'],
  },
  {
    id: 'szukaj', name: 'Szukaj smakołyków', cat: 'brain', lvl: 1, cue: 'Szukaj', signal: 'Ręka zamiata podłogę',
    why: '10 minut węszenia męczy psa bardziej niż 30 minut biegania — i uspokaja zamiast nakręcać.',
    stages: [
      { t: 'Na widoku', d: 'Pies czeka (lub ktoś trzyma). Rozrzuć 5 smakołyków na widoku, „Szukaj!”.', goal: 'Szuka z entuzjazmem' },
      { t: 'Ukryte w pokoju', d: 'Pod poduszką, za nogą krzesła, na niskiej półce.', goal: 'Znajduje 10 ukrytych' },
      { t: 'Ukryte poza wzrokiem', d: 'Pies czeka w innym pokoju. Chowasz w trudniejszych miejscach.', goal: '10 w 2 min' },
      { t: 'Na trawie / w lesie', d: 'Rozrzut na trawie, ślad smakołyków prowadzący do „skarbu”.', goal: 'Krótki ślad 10 m' },
    ],
    tips: ['Świetne na deszczowe dni i po ekscytujących sytuacjach.'], mistakes: [],
  },
  {
    id: 'nosework', name: 'Nosework — szukanie zapachu', cat: 'brain', lvl: 3, cue: 'Szukaj [zapach]', signal: '—', pre: ['szukaj'],
    why: 'Pies uczy się znajdować konkretny zapach (np. herbata, goździk) w pudełkach, potem w pokoju. Sport węchowy dla każdego psa.',
    stages: [
      { t: 'Zapach = jackpot', d: 'Patyczek do uszu z zapachem w pojemniku z dziurkami + smakołyk. Pies wącha → nagroda.', goal: 'Pies szuka pojemnika' },
      { t: 'Pudełka', d: '3–5 kartonów, w jednym zapach. Nagroda przy właściwym pudełku.', goal: 'Trafia 8 z 10' },
      { t: 'Wskazanie', d: 'Nagradzaj, gdy pies zostaje nosem przy źródle (np. siad/zamarcie).', goal: 'Wyraźne wskazanie' },
      { t: 'Pokój i auto', d: 'Ukryty zapach w pokoju, na kole auta, w ogrodzie.', goal: 'Znajduje w nowym miejscu' },
    ],
    tips: ['Jeśli spodoba Wam się — w Polsce działają kluby nosework.'], mistakes: [],
  },
  {
    id: 'chowany', name: 'Zabawa w chowanego', cat: 'brain', lvl: 1, cue: 'Szukaj [imię]', signal: '—', pre: ['zostan'],
    why: 'Jedno z Was trzyma psa (lub pies „zostaje”), drugie się chowa. Ćwiczy przywołanie, węch i jest świetną zabawą dla Was obojga.',
    stages: [
      { t: 'Łatwe kryjówki', d: 'Chowasz się za drzwiami, wołasz raz. Pies znajduje → impreza!', goal: 'Szybko znajduje' },
      { t: 'Bez wołania', d: 'Pies szuka węchem, Ty milczysz.', goal: 'Znajduje w 1 min' },
      { t: 'Na zewnątrz', d: 'Za drzewem w parku (bezpieczne miejsce, pies na lince lub z dobrym przywołaniem).', goal: '3 udane' },
    ],
    tips: [], mistakes: [],
  },
  {
    id: 'frisbee', name: 'Frisbee — podstawy', cat: 'brain', lvl: 3, cue: 'Łap', signal: '—', pre: ['aport'],
    why: 'Collie są stworzone do frisbee. Ważne: miękki dysk dla psów, niskie rzuty, żadnych skoków na start, póki technika nie jest dobra.',
    stages: [
      { t: 'Dysk = miska', d: 'Karmienie z odwróconego dysku. Dysk staje się cenny.', goal: 'Pies szaleje na widok dysku' },
      { t: 'Rolki', d: 'Toczenie dysku po ziemi jak kółko. Pies goni i przynosi.', goal: '8 z 10 przyniesień' },
      { t: 'Krótkie rzuty', d: 'Niskie, płaskie rzuty na 3–5 m.', goal: 'Łapie w powietrzu 5 razy' },
      { t: 'Dłuższe rzuty', d: 'Stopniowo dalej; bez wysokich skoków.', goal: '10 m, 5 złapanych' },
    ],
    tips: ['Max kilkanaście rzutów na sesję — chrońcie stawy i głowę przed „obsesją”.'], mistakes: ['Rzuty pionowo w górę — ryzyko kontuzji przy lądowaniu.'],
  },
  {
    id: 'puzzle', name: 'Zabawki-łamigłówki', cat: 'brain', lvl: 1, cue: '—', signal: '—',
    why: 'Kong, mata węchowa, butelka w kartonie, „burrito” z ręcznika. Samodzielna praca głową — dobra, gdy nie macie czasu na trening.',
    stages: [
      { t: 'Łatwe', d: 'Mata węchowa, Kong z suchą karmą.', goal: 'Pies kończy samodzielnie' },
      { t: 'Średnie', d: 'Ręcznik zwinięty z karmą w środku, karton z papierem i smakołykami.', goal: 'Bez frustracji' },
      { t: 'Trudne', d: 'Zamrożony Kong, łamigłówka z przesuwanymi elementami.', goal: '15 min skupienia' },
    ],
    tips: ['Część dziennej porcji karmy można podawać w zabawkach.'], mistakes: [],
  },
];

export const exById = (id, custom = []) => EXERCISES.find((e) => e.id === id) || custom.find((e) => e.id === id);
