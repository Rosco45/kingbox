export const VERIFIED_STREAM_1 = "https://vjs.zencdn.net/v/oceans.mp4";
export const VERIFIED_STREAM_2 = "https://media.w3.org/2010/05/sintel/trailer_hd.mp4";

export const FEATURED_HERO = {
  id: "hero-1",
  tmdbId: 114479, // Solo Leveling TMDB ID
  title: "Solo Leveling: ReAwakening",
  originalTitle: "Ore dake Level Up na Ken",
  type: "anime",
  badge: "TOP 1 AUJOURD'HUI",
  rating: 9.1,
  year: 2024,
  quality: "4K UHD",
  duration: "2 Saisons",
  genres: ["Action", "Fantasy", "Animation", "Aventure"],
  backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80",
  poster: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
  synopsis: "Dans un monde où des chasseurs aux pouvoirs magiques affrontent des monstres mortels pour protéger l'humanité, Sung Jinwoo, le chasseur le plus faible de tous, se retrouve face à un donjon double secret qui change son destin à jamais.",
  cast: ["Taito Ban", "Genta Nakamura", "Reina Ueda"],
  director: "Shunsuke Nakashige",
  videoUrl: VERIFIED_STREAM_1,
  episodes: [
    { number: 1, title: "Je suis habitué", duration: "24 min", videoUrl: VERIFIED_STREAM_1 },
    { number: 2, title: "Si j'avais une autre chance", duration: "24 min", videoUrl: VERIFIED_STREAM_2 },
    { number: 3, title: "C'est comme un jeu", duration: "23 min", videoUrl: VERIFIED_STREAM_1 },
    { number: 4, title: "Je dois devenir plus fort", duration: "25 min", videoUrl: VERIFIED_STREAM_2 },
  ]
};

export const MEDIA_LIST = [
  // FILMS
  {
    id: "film-1",
    tmdbId: 693134, // Dune: Part Two
    title: "Dune: Deuxième Partie",
    type: "movie",
    rating: 8.9,
    year: 2024,
    quality: "4K HDR",
    duration: "2h 46min",
    genres: ["Science-Fiction", "Aventure", "Drame"],
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
    synopsis: "Paul Atreides s'unit à Chani et aux Fremen tout en préparant sa revanche contre les conspirateurs qui ont détruit sa famille. Face à un choix entre l'amour de sa vie et le destin de l'univers...",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem"],
    videoUrl: VERIFIED_STREAM_2,
    trending: true,
    popular: true
  },
  {
    id: "film-2",
    tmdbId: 533535, // Deadpool & Wolverine
    title: "Deadpool & Wolverine",
    type: "movie",
    rating: 8.2,
    year: 2024,
    quality: "4K UHD",
    duration: "2h 08min",
    genres: ["Action", "Comédie", "Science-Fiction"],
    poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80",
    synopsis: "Wolverine se remet de ses blessures lorsqu'il croise le chemin de l'irrévérencieux Deadpool. Ensemble, ils s'allient pour vaincre un ennemi commun et sauver l'univers.",
    cast: ["Ryan Reynolds", "Hugh Jackman", "Emma Corrin"],
    videoUrl: VERIFIED_STREAM_1,
    trending: true,
    popular: true
  },
  {
    id: "film-3",
    tmdbId: 872585, // Oppenheimer
    title: "Oppenheimer",
    type: "movie",
    rating: 8.9,
    year: 2023,
    quality: "4K UHD",
    duration: "3h 00min",
    genres: ["Drame", "Histoire", "Biopic"],
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    synopsis: "L'histoire du physicien J. Robert Oppenheimer, directeur scientifique du projet Manhattan, qui a développé la première bombe atomique de l'histoire.",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    videoUrl: VERIFIED_STREAM_2,
    trending: false,
    popular: true
  },
  {
    id: "film-4",
    tmdbId: 569094, // Spider-Man: Across the Spider-Verse
    title: "Spider-Man: Across the Spider-Verse",
    type: "movie",
    rating: 8.8,
    year: 2023,
    quality: "4K",
    duration: "2h 20min",
    genres: ["Animation", "Action", "Aventure"],
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80",
    synopsis: "Miles Morales est catapulté à travers le Multivers, où il rencontre une équipe de Spider-Héros chargée de protéger son existence même.",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
    videoUrl: VERIFIED_STREAM_1,
    trending: true,
    popular: true
  },
  {
    id: "film-5",
    tmdbId: 157336, // Interstellar
    title: "Interstellar",
    type: "movie",
    rating: 8.7,
    year: 2014,
    quality: "4K IMAX",
    duration: "2h 49min",
    genres: ["Science-Fiction", "Drame", "Aventure"],
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80",
    synopsis: "Une équipe d'explorateurs voyage à travers un trou de ver récemment découvert afin de surpasser les limites du voyage spatial humain et trouver une nouvelle planète habitable.",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    videoUrl: VERIFIED_STREAM_2,
    trending: false,
    popular: true
  },

  // SÉRIES
  {
    id: "serie-1",
    tmdbId: 66732, // Stranger Things
    title: "Stranger Things",
    type: "tv",
    rating: 8.7,
    year: 2024,
    quality: "4K Dolby Vision",
    duration: "4 Saisons",
    genres: ["Fantastique", "Horreur", "Drame"],
    poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
    synopsis: "À Hawkins en 1983, un jeune garçon disparaît soudainement. Ses amis, sa famille et la police locale se retrouvent plongés dans une affaire mêlant expériences secrètes et forces surnaturelles.",
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder", "David Harbour"],
    videoUrl: VERIFIED_STREAM_1,
    trending: true,
    popular: true,
    episodes: [
      { number: 1, title: "Chapitre Un : La disparition", duration: "48 min", videoUrl: VERIFIED_STREAM_1 },
      { number: 2, title: "Chapitre Deux : La barjo de Maple Street", duration: "55 min", videoUrl: VERIFIED_STREAM_2 },
      { number: 3, title: "Chapitre Trois : Petit papa Noël", duration: "51 min", videoUrl: VERIFIED_STREAM_1 },
    ]
  },
  {
    id: "serie-2",
    tmdbId: 100088, // The Last of Us
    title: "The Last of Us",
    type: "tv",
    rating: 8.8,
    year: 2023,
    quality: "4K UHD",
    duration: "1 Saison",
    genres: ["Action", "Aventure", "Drame", "Post-Apocalyptique"],
    poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
    synopsis: "Vingt ans après la destruction de la civilisation moderne, Joel, un survivant endurci, est engagé pour faire sortir Ellie, une jeune fille de 14 ans, d'une zone de quarantaine oppressive.",
    cast: ["Pedro Pascal", "Bella Ramsey", "Gabriel Luna"],
    videoUrl: VERIFIED_STREAM_2,
    trending: true,
    popular: true,
    episodes: [
      { number: 1, title: "Quand tu es perdu dans les ténèbres", duration: "1h 21min", videoUrl: VERIFIED_STREAM_2 },
      { number: 2, title: "Infecté", duration: "53 min", videoUrl: VERIFIED_STREAM_1 }
    ]
  },
  {
    id: "serie-3",
    tmdbId: 94997, // House of the Dragon
    title: "House of the Dragon",
    type: "tv",
    rating: 8.5,
    year: 2024,
    quality: "4K UHD",
    duration: "2 Saisons",
    genres: ["Action", "Aventure", "Drame", "Fantasy"],
    poster: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80",
    synopsis: "L'histoire de la famille Targaryen, près de 200 ans avant les événements de Game of Thrones, alors que débute la guerre civile connue sous le nom de Danse des Dragons.",
    cast: ["Matt Smith", "Emma D'Arcy", "Olivia Cooke"],
    videoUrl: VERIFIED_STREAM_1,
    trending: true,
    popular: true,
    episodes: [
      { number: 1, title: "Les Héritiers du Dragon", duration: "1h 06min", videoUrl: VERIFIED_STREAM_1 },
      { number: 2, title: "Le Prince Rebelle", duration: "54 min", videoUrl: VERIFIED_STREAM_2 }
    ]
  },
  {
    id: "serie-4",
    tmdbId: 94605, // Arcane
    title: "Arcane",
    type: "tv",
    rating: 9.0,
    year: 2024,
    quality: "4K HDR",
    duration: "2 Saisons",
    genres: ["Animation", "Action", "Science-Fiction"],
    poster: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80",
    synopsis: "Au milieu du conflit entre les villes jumelles de Piltover et Zaun, deux sœurs se battent dans des camps opposés d'une guerre entre technologies magiques et croyances incompatibles.",
    cast: ["Hailee Steinfeld", "Ella Purnell", "Kevin Alejandro"],
    videoUrl: VERIFIED_STREAM_2,
    trending: true,
    popular: true,
    episodes: [
      { number: 1, title: "Bienvenue dans le jeu", duration: "43 min", videoUrl: VERIFIED_STREAM_2 },
      { number: 2, title: "Certains mystères restent entiers", duration: "41 min", videoUrl: VERIFIED_STREAM_1 }
    ]
  },

  // ANIMÉS
  {
    id: "anime-1",
    tmdbId: 85937, // Demon Slayer
    title: "Demon Slayer: Kimetsu no Yaiba",
    type: "anime",
    rating: 8.7,
    year: 2024,
    quality: "Full HD",
    duration: "4 Saisons",
    genres: ["Action", "Animation", "Surnaturel"],
    poster: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80",
    synopsis: "Après le massacre de sa famille par un démon et la transformation de sa sœur en démon, Tanjiro Kamado devient pourfendeur de démons pour sauver Nezuko et venger les siens.",
    cast: ["Natsuki Hanae", "Akari Kito", "Hiro Shimono"],
    videoUrl: VERIFIED_STREAM_1,
    trending: true,
    popular: true,
    episodes: [
      { number: 1, title: "Cruauté", duration: "23 min", videoUrl: VERIFIED_STREAM_1 },
      { number: 2, title: "L'instructeur Sakonji Urokodaki", duration: "23 min", videoUrl: VERIFIED_STREAM_2 },
      { number: 3, title: "Renaître", duration: "23 min", videoUrl: VERIFIED_STREAM_1 }
    ]
  },
  {
    id: "anime-2",
    tmdbId: 95479, // Jujutsu Kaisen
    title: "Jujutsu Kaisen",
    type: "anime",
    rating: 8.6,
    year: 2023,
    quality: "Full HD",
    duration: "2 Saisons",
    genres: ["Action", "Animation", "Surnaturel", "Dark Fantasy"],
    poster: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
    synopsis: "Yuji Itadori, un lycéen doué d'une force physique hors du commun, avale un doigt maudit du roi des fléaux Ryomen Sukuna pour sauver ses camarades et s'initie à l'exorcisme.",
    cast: ["Junya Enoki", "Yuma Uchida", "Asami Seto"],
    videoUrl: VERIFIED_STREAM_2,
    trending: true,
    popular: true,
    episodes: [
      { number: 1, title: "Ryomen Sukuna", duration: "24 min", videoUrl: VERIFIED_STREAM_2 },
      { number: 2, title: "Pour moi-même", duration: "24 min", videoUrl: VERIFIED_STREAM_1 }
    ]
  },
  {
    id: "anime-3",
    tmdbId: 1429, // Attack on Titan
    title: "L'Attaque des Titans (Shingeki no Kyojin)",
    type: "anime",
    rating: 9.1,
    year: 2023,
    quality: "4K UHD",
    duration: "4 Saisons",
    genres: ["Action", "Drame", "Mystère", "Dark Fantasy"],
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=80",
    synopsis: "L'humanité vit enfermée dans des cités entourées d'immenses murs pour se protéger des Titans, de gigantesques créatures dévoreuses d'hommes. Eren Jaeger jure d'éradiquer chaque Titan de la Terre.",
    cast: ["Yuki Kaji", "Yui Ishikawa", "Marina Inoue"],
    videoUrl: VERIFIED_STREAM_1,
    trending: true,
    popular: true,
    episodes: [
      { number: 1, title: "À toi, qui vis 2000 ans plus tard", duration: "25 min", videoUrl: VERIFIED_STREAM_1 },
      { number: 2, title: "Ce jour-là", duration: "25 min", videoUrl: VERIFIED_STREAM_2 }
    ]
  },
  {
    id: "anime-4",
    tmdbId: 37854, // One Piece
    title: "One Piece (Saga Egghead)",
    type: "anime",
    rating: 8.9,
    year: 2024,
    quality: "Full HD",
    duration: "21 Saisons",
    genres: ["Aventure", "Action", "Comédie", "Fantasy"],
    poster: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80",
    backdrop: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=80",
    synopsis: "Monkey D. Luffy et son équipage de pirates voyagent à travers Grand Line à la recherche du légendaire trésor One Piece pour devenir le prochain Roi des Pirates.",
    cast: ["Mayumi Tanaka", "Kazuya Nakai", "Akemi Okamura"],
    videoUrl: VERIFIED_STREAM_2,
    trending: true,
    popular: true,
    episodes: [
      { number: 1089, title: "Vers un nouveau chapitre ! L'île du futur, Egghead !", duration: "24 min", videoUrl: VERIFIED_STREAM_2 },
      { number: 1090, title: "Nouvelle île ! L'île futuriste d'Egghead !", duration: "24 min", videoUrl: VERIFIED_STREAM_1 }
    ]
  }
];

export const GENRES = [
  "Tous",
  "Action",
  "Aventure",
  "Animation",
  "Science-Fiction",
  "Comédie",
  "Drame",
  "Fantastique",
  "Horreur"
];
