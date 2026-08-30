-- Sample curriculum for the audio learning MVP.
-- Run after 001_schema.sql. Safe to run once on an empty database.

do $$
declare
  module_id uuid;
  chapter_id uuid;
begin
  insert into public.modules (title, description, sequence_order)
  values (
    'Etapa 1: Fundația și Comunicarea',
    'Hardware, sistem de operare și rețea — cum funcționează mașina și cum vorbește cu altele.',
    1
  )
  returning id into module_id;

  insert into public.chapters (module_id, title, sequence_order)
  values (module_id, 'Hardware / OS', 1)
  returning id into chapter_id;

  insert into public.subchapters (chapter_id, title, content_rules, sequence_order)
  values
    (
      chapter_id,
      'CPU, RAM și disc',
      '[
        "CPU-ul execută instrucțiuni; RAM-ul ține datele la care se lucrează acum; discul păstrează datele când oprești mașina.",
        "Dacă RAM-ul se umple, sistemul începe să folosească discul (swap) și totul încetinește vizibil.",
        "Un proces este un program în execuție; un thread este o linie de lucru în interiorul acelui proces."
      ]'::jsonb,
      1
    ),
    (
      chapter_id,
      'Procese, thread-uri și permisiuni',
      '[
        "Sistemul de operare izolează procesele și decide cine poate citi sau scrie un fișier.",
        "Pe Windows, permisiunile (ACL) și User Account Control limitează ce poate face un program fără drepturi de administrator.",
        "Când un program „nu are voie”, de obicei e o problemă de permisiuni, nu de logică a codului."
      ]'::jsonb,
      2
    );

  insert into public.chapters (module_id, title, sequence_order)
  values (module_id, 'Rețea', 2)
  returning id into chapter_id;

  insert into public.subchapters (chapter_id, title, content_rules, sequence_order)
  values
    (
      chapter_id,
      'DNS, TCP și HTTP',
      '[
        "DNS traduce un nume (example.com) într-o adresă IP pe care calculatorul o poate contacta.",
        "TCP asigură că pachetele ajung complete și în ordine; HTTP este limbajul cererilor pe deasupra TCP.",
        "O cerere HTTP are metodă (GET, POST), cale, headere și uneori un body."
      ]'::jsonb,
      1
    ),
    (
      chapter_id,
      'Ce este un API',
      '[
        "Un API este un contract: trimiți un request într-un format agreat și primești un răspuns previzibil.",
        "REST peste HTTP folosește de obicei JSON; statusul (200, 400, 401, 500) îți spune dacă operația a reușit.",
        "Autentificarea (chei, JWT, cookie-uri) spune serverului cine ești, nu doar ce vrei."
      ]'::jsonb,
      2
    );

  insert into public.modules (title, description, sequence_order)
  values (
    'Etapa 2: Logica și Memoria',
    'Limbaje, paradigme și stocarea datelor.',
    2
  )
  returning id into module_id;

  insert into public.chapters (module_id, title, sequence_order)
  values (module_id, 'Limbaje / paradigme', 1)
  returning id into chapter_id;

  insert into public.subchapters (chapter_id, title, content_rules, sequence_order)
  values
    (
      chapter_id,
      'Imperativ, OOP și funcțional',
      '[
        "Imperativ: spui pașii (for, if, asignări).",
        "OOP: grupezi stare și comportament în obiecte; util când modelezi entități din lumea reală.",
        "Funcțional: transformi date fără a muta starea originală; ușor de testat, mai previzibil."
      ]'::jsonb,
      1
    ),
    (
      chapter_id,
      'Script vs sistem',
      '[
        "Python și JavaScript sunt excelente pentru scripturi, API-uri și prototipuri rapide.",
        "Rust (și limbajele de sistem) îți dau control pe memorie și performanță, cu un cost de complexitate.",
        "Alege uneltele după constrângere: viteză de livrare vs garanții de corectitudine."
      ]'::jsonb,
      2
    );

  insert into public.chapters (module_id, title, sequence_order)
  values (module_id, 'Date', 2)
  returning id into chapter_id;

  insert into public.subchapters (chapter_id, title, content_rules, sequence_order)
  values
    (
      chapter_id,
      'Fișiere, JSON și SQL',
      '[
        "Fișierele sunt potrivite pentru documente, exporturi și artefacte (un MP3, un CSV).",
        "JSON este formatul natural între frontend și API: obiecte și liste, fără schemă rigidă.",
        "SQL e pentru date relaționale, interogări, constrângeri și consistență — aici stă curricula."
      ]'::jsonb,
      1
    );

  insert into public.modules (title, description, sequence_order)
  values (
    'Etapa 3: Execuția și Livrarea',
    'Tipuri de aplicații și bune practici de inginerie.',
    3
  )
  returning id into module_id;

  insert into public.chapters (module_id, title, sequence_order)
  values (module_id, 'Aplicații', 1)
  returning id into chapter_id;

  insert into public.subchapters (chapter_id, title, content_rules, sequence_order)
  values
    (
      chapter_id,
      'CLI, web, serviciu, agent',
      '[
        "CLI: un script pe care îl rulezi în terminal; bun pentru joburi, seed și automatizări.",
        "Web: interfață în browser; aici trăiește player-ul audio.",
        "Serviciu / agent: procese care așteaptă evenimente (webhook, cron) și lucrează fără un om în față."
      ]'::jsonb,
      1
    );

  insert into public.chapters (module_id, title, sequence_order)
  values (module_id, 'Inginerie', 2)
  returning id into chapter_id;

  insert into public.subchapters (chapter_id, title, content_rules, sequence_order)
  values
    (
      chapter_id,
      'Git, test, deploy, securitate',
      '[
        "Git păstrează istoricul; un commit bun spune de ce s-a schimbat ceva, nu doar ce.",
        "Testele și debug-ul prind regresii înainte să le prindă utilizatorul.",
        "Deploy-ul pune o versiune în fața lumii; secretele (chei API) nu stau în git, ci în environment."
      ]'::jsonb,
      1
    );

  insert into public.modules (title, description, sequence_order)
  values (
    'Etapa 4: Data Science și Inteligență Artificială',
    'De la curățarea datelor la modele predictive și integrarea cu LLM-uri.',
    4
  )
  returning id into module_id;

  insert into public.chapters (module_id, title, sequence_order)
  values (module_id, 'Capitolul 1: Fundamentele și Procesarea Datelor', 1)
  returning id into chapter_id;

  insert into public.subchapters (chapter_id, title, content_rules, sequence_order)
  values
    (
      chapter_id,
      '1.1 Ecosistemul Python pentru Date',
      '[
        "Pandas este Excel-ul pe steroizi, folosit pentru a manipula tabele uriașe de date (DataFrames).",
        "NumPy este librăria fundamentală pentru calcule matematice extrem de rapide.",
        "Regula de aur: nu folosi loop-uri for pe volume mari; folosește funcțiile vectorizate din Pandas."
      ]'::jsonb,
      1
    ),
    (
      chapter_id,
      '1.2 Curățarea Datelor (Data Cleaning)',
      '[
        "Curățarea datelor îți va ocupa 80% din timp într-un proiect real.",
        "Trebuie să decizi constant: ștergi datele lipsă (NaN) sau le înlocuiești cu media/mediana?",
        "Normalizarea este obligatorie: algoritmii sunt sensibili dacă o coloană e 1–10 și alta 1–1.000.000."
      ]'::jsonb,
      2
    );

  insert into public.chapters (module_id, title, sequence_order)
  values (module_id, 'Capitolul 2: Analiză și Modele Predictive', 2)
  returning id into chapter_id;

  insert into public.subchapters (chapter_id, title, content_rules, sequence_order)
  values
    (
      chapter_id,
      '2.1 Analiza Exploratorie a Datelor (EDA)',
      '[
        "EDA este etapa în care te joci cu datele pentru a descoperi vizual corelații ascunse.",
        "Corelația nu înseamnă cauzalitate: două grafice care cresc la fel nu dovedesc influență.",
        "Matplotlib și Seaborn sunt librăriile standard pentru grafice din Python."
      ]'::jsonb,
      1
    ),
    (
      chapter_id,
      '2.2 Algoritmi Fundamentali (Scikit-Learn)',
      '[
        "Regresia prezice un număr continuu (ex: prețul unei case pe baza suprafeței).",
        "Clasificarea împarte datele în categorii (ex: Spam sau Non-Spam).",
        "Clustering-ul (nesupervizat) găsește grupuri naturale fără să îi spui ce să caute."
      ]'::jsonb,
      2
    ),
    (
      chapter_id,
      '2.3 Evaluarea și Antrenarea Modelului',
      '[
        "Datele se împart mereu în Train (80%) și Test (20%).",
        "Overfitting-ul apare când modelul memorează antrenamentul și eșuează pe date noi.",
        "Acuratețea nu e totul: un False Negative medical e adesea mai grav decât un False Positive."
      ]'::jsonb,
      3
    );

  insert into public.chapters (module_id, title, sequence_order)
  values (module_id, 'Capitolul 3: AI Modern și Implementare', 3)
  returning id into chapter_id;

  insert into public.subchapters (chapter_id, title, content_rules, sequence_order)
  values
    (
      chapter_id,
      '3.1 Expunerea Modelului via API',
      '[
        "Un model de Machine Learning se salvează ca fișier binar (ex: Joblib).",
        "FastAPI este standardul actual pentru a-l expune ca serviciu web.",
        "Frontend-ul trimite JSON cu date brute; backend-ul returnează predicția."
      ]'::jsonb,
      1
    ),
    (
      chapter_id,
      '3.2 Integrarea cu LLM-uri (Generative AI)',
      '[
        "Data Science modern include orchestrarea LLM-urilor prin API-uri.",
        "RAG oferă modelului documentele tale private înainte de întrebare.",
        "Prompt engineering-ul programmatic înlocuiește adesea antrenarea costisitoare pentru text."
      ]'::jsonb,
      2
    );
end $$;
