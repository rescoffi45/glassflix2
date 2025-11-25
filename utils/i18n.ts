
import { Language } from '../types';

export const translations = {
  en: {
    // Navbar
    discover: 'Discover',
    toWatch: 'To Watch',
    agenda: 'Agenda',
    seen: 'Seen',
    aiCurator: 'AI Curator',
    login: 'Login',
    logout: 'Logout',
    
    // Auth
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    enterCredentials: 'Enter your credentials to access your lists',
    startJourney: 'Start your collection journey today',
    username: 'Username',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    processing: 'Processing...',
    
    // Cards
    watch: 'Watch',
    markSeen: 'Mark Seen',
    remove: 'Remove',
    inWatchlist: 'In Watchlist',
    addToWatchlist: 'Add to Watchlist',
    
    // Media Details
    nextEpisode: 'Next Episode',
    seasons: 'Seasons',
    movie: 'Movie',
    tvSeries: 'TV Series',
    overview: 'Overview',
    availableOn: 'Available on',
    topCast: 'Top Cast',
    officialTrailer: 'Official Trailer',
    openInYoutube: 'Open in YouTube',
    
    // Filter Bar
    sortBy: 'Sort By',
    added: 'Added',
    release: 'Release',
    rating: 'Rating',
    az: 'A-Z',
    view: 'View',
    
    // Discover Filters
    popular: 'Popular',
    trendingToday: 'Trending Today',
    filters: 'Filters',
    allCountries: 'All Countries',
    france: 'France',
    southKorea: 'South Korea',
    usa: 'United States',
    uk: 'United Kingdom',
    movies: 'Movies',
    series: 'Series',
    
    // Agenda
    upcomingAgenda: 'Upcoming Agenda',
    agendaSubtitle: 'All upcoming episodes and premieres from your watchlist.',
    noEvents: 'No Upcoming Events',
    noEventsSub: 'Add TV shows with future episodes to your "To Watch" list.',
    
    // AI
    aiSubtitle: 'GlassFlix analyzes your "Seen" history to find hidden gems just for you.',
    notEnoughData: 'Not enough data',
    notEnoughDataSub: 'Please mark at least 3 movies or shows as "Seen" to unlock AI recommendations.',
    generate: 'Generate Suggestions',
    consulting: 'Consulting the digital oracle...',
    topPicks: 'Top Picks for You',
    refresh: 'Refresh',
    findAdd: 'Find & Add',
    
    // Search
    searchPlaceholder: 'Search movies, TV shows...',
    noResults: 'No results found for',
    typeToSearch: 'Type to search the TMDB universe',
    
    // Settings
    settings: 'Settings',
    dataSettings: 'Data Settings',
    export: 'Export Collection',
    exportSub: 'Download a JSON backup of your entire Watchlist and Seen history.',
    downloadBackup: 'Download Backup',
    import: 'Import Collection',
    importSub: 'Restore your collection from a previously exported JSON file.',
    selectFile: 'Select File',
    language: 'Interface Language',
    languageSub: 'Change the language of the application interface and content.',
    english: 'English',
    french: 'French',
    
    // Empty States
    emptyWatchlist: 'Your To Watch list is empty.',
    emptySeen: 'Your Seen history is empty.',
    itemsCollected: 'items collected',
    startAdding: 'Start adding movies from Discover or Search!',
    trending: 'Trending Now',
    trendingSub: 'Most popular movies and shows this week',
    trendingSubDay: 'The most watched movies and shows in the last 24h'
  },
  fr: {
    // Navbar
    discover: 'Découvrir',
    toWatch: 'À voir',
    agenda: 'Agenda',
    seen: 'Vus',
    aiCurator: 'Curateur IA',
    login: 'Connexion',
    logout: 'Déconnexion',
    
    // Auth
    welcomeBack: 'Bon retour',
    createAccount: 'Créer un compte',
    enterCredentials: 'Entrez vos identifiants pour accéder à vos listes',
    startJourney: 'Commencez votre collection aujourd\'hui',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    signIn: 'Se connecter',
    signUp: 'S\'inscrire',
    noAccount: "Pas de compte ?",
    hasAccount: "Déjà un compte ?",
    processing: 'Traitement...',
    
    // Cards
    watch: 'À voir',
    markSeen: 'Vu',
    remove: 'Supprimer',
    inWatchlist: 'Dans la liste',
    addToWatchlist: 'Ajouter à la liste',
    
    // Media Details
    nextEpisode: 'Prochain Épisode',
    seasons: 'Saisons',
    movie: 'Film',
    tvSeries: 'Série TV',
    overview: 'Synopsis',
    availableOn: 'Disponible sur',
    topCast: 'Casting',
    officialTrailer: 'Bande-annonce',
    openInYoutube: 'Ouvrir sur YouTube',
    
    // Filter Bar
    sortBy: 'Trier par',
    added: 'Date d\'ajout',
    release: 'Date de sortie',
    rating: 'Note',
    az: 'A-Z',
    view: 'Vue',
    
    // Discover Filters
    popular: 'Populaires',
    trendingToday: 'Tendance Aujourd\'hui',
    filters: 'Filtres',
    allCountries: 'Tous pays',
    france: 'France',
    southKorea: 'Corée du Sud',
    usa: 'États-Unis',
    uk: 'Angleterre',
    movies: 'Films',
    series: 'Séries',
    
    // Agenda
    upcomingAgenda: 'Agenda à venir',
    agendaSubtitle: 'Tous les prochains épisodes et premières de votre liste.',
    noEvents: 'Aucun événement à venir',
    noEventsSub: 'Ajoutez des séries avec des futurs épisodes à votre liste "À voir".',
    
    // AI
    aiSubtitle: 'GlassFlix analyse votre historique "Vus" pour dénicher des pépites pour vous.',
    notEnoughData: 'Pas assez de données',
    notEnoughDataSub: 'Veuillez marquer au moins 3 films ou séries comme "Vus" pour débloquer l\'IA.',
    generate: 'Générer des suggestions',
    consulting: 'Consultation de l\'oracle numérique...',
    topPicks: 'Sélections pour vous',
    refresh: 'Rafraîchir',
    findAdd: 'Trouver & Ajouter',
    
    // Search
    searchPlaceholder: 'Rechercher films, séries...',
    noResults: 'Aucun résultat pour',
    typeToSearch: 'Tapez pour explorer l\'univers TMDB',
    
    // Settings
    settings: 'Paramètres',
    dataSettings: 'Paramètres de données',
    export: 'Exporter la collection',
    exportSub: 'Téléchargez une sauvegarde JSON de votre historique.',
    downloadBackup: 'Télécharger sauvegarde',
    import: 'Importer la collection',
    importSub: 'Restaurez votre collection depuis un fichier JSON.',
    selectFile: 'Choisir un fichier',
    language: 'Langue de l\'interface',
    languageSub: 'Changez la langue de l\'application et du contenu.',
    english: 'Anglais',
    french: 'Français',
    
    // Empty States
    emptyWatchlist: 'Votre liste "À voir" est vide.',
    emptySeen: 'Votre historique "Vus" est vide.',
    itemsCollected: 'éléments collectés',
    startAdding: 'Commencez à ajouter des films depuis Découvrir ou Recherche !',
    trending: 'Tendances actuelles',
    trendingSub: 'Films et séries populaires cette semaine',
    trendingSubDay: 'Les films et séries les plus regardés ces dernières 24h'
  }
};

export const getTMDBLocale = (lang: Language) => {
    return lang === 'fr' ? 'fr-FR' : 'en-US';
};
