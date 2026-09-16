import type { CardTypeSeed } from "./card-catalog";

export interface CardPackSeed {
  id: string; name: string; description: string; emoji: string; isPremium: boolean; sortOrder: number;
  legendariesPerPlayer: number; raresPerPlayer: number; commonsPerPlayer: number; responseWindowMinutes: number;
  cardIds: string[];
}

const A = (id: string, name: string, description: string, category: string, rarity: CardTypeSeed["rarity"], emoji: string, sortOrder: number): CardTypeSeed => ({ id, name, description, kind: "ATTACK", category, rarity, emoji, sortOrder });

export const PACK_CARDS: CardTypeSeed[] = [
  // Despedida de solter@
  A("anillo-maldito", "Anillo maldito", "Durante 1 hora, el jugador debe pedir permiso al homenajeado o la homenajeada antes de hablar. Si se le olvida, el grupo decide el castigo.", "despedida", "LEGENDARY", "💍", 100),
  A("discurso-sorpresa", "Discurso sorpresa", "El jugador improvisa un brindis de 1 minuto sobre la pareja delante de desconocidos, con copa en alto.", "despedida", "LEGENDARY", "🎤", 101),
  A("guardaespaldas", "Guardaespaldas", "Durante 2 horas no puede separarse más de 2 metros de quien se casa. Cada vez que lo haga, chupito o reto a elección del grupo.", "despedida", "LEGENDARY", "🕶️", 102),
  A("tatuaje-temporal", "Tatuaje temporal", "El grupo decide qué le pintan en el brazo con rotulador. Se lo lleva hasta mañana.", "reto", "RARE", "✍️", 103),
  A("banda-sonora", "Banda sonora", "Durante 30 minutos, cada vez que el jugador entre en un sitio el grupo canta su canción de entrada.", "social", "RARE", "🎶", 104),
  A("confesion-de-boda", "Confesión de boda", "Cuenta la anécdota más vergonzosa que sepas de quien se casa. Nada de tapar.", "social", "RARE", "🤭", 105),
  A("ligar-por-encargo", "Ligar por encargo", "Tiene 15 minutos para conseguir el nombre y una foto con un desconocido que elija el grupo.", "reto", "RARE", "😏", 106),
  A("ronda-de-honor", "Ronda de honor", "Invita a una ronda a quien se casa y a quien esté a su lado en ese momento.", "bebida", "RARE", "🍾", 107),
  A("pose-de-catalogo", "Pose de catálogo", "Foto de grupo en la que el jugador posa como modelo de catálogo de trajes de boda.", "reto", "COMMON", "🕴️", 108),
  A("apodo-oficial", "Apodo oficial", "El grupo le pone un apodo y todos deben usarlo el resto del día.", "social", "COMMON", "🏷️", 109),
  A("brindis-obligado", "Brindis obligado", "Chupito brindando con una frase para la pareja. Si la frase es mala, repite.", "bebida", "COMMON", "🥂", 110),
  A("karaoke-express", "Karaoke exprés", "Canta el estribillo de la canción favorita de la pareja donde estéis.", "reto", "COMMON", "🎵", 111),
  A("accesorio-ridiculo", "Accesorio ridículo", "Lleva el complemento más ridículo que tenga el grupo durante 1 hora.", "reto", "COMMON", "👑", 112),
  A("foto-con-cartel", "Foto con cartel", "Consigue que un desconocido sostenga un cartel de «última noche libre» y hazle la foto con quien se casa.", "social", "COMMON", "🪧", 113),

  // Erasmus
  A("traductor-oficial", "Traductor oficial", "Durante 2 horas solo puede hablar en un idioma que no sea el suyo. Si se le escapa una palabra, bebe.", "idiomas", "LEGENDARY", "🗣️", 200),
  A("embajador", "Embajador/a", "Durante 2 horas representa al país que elija el grupo: acento, gestos y opiniones incluidas.", "cultura", "LEGENDARY", "🌍", 201),
  A("anfitrion-internacional", "Anfitrión internacional", "Organiza la próxima cena con una receta de su país y paga la compra.", "cultura", "LEGENDARY", "🍲", 202),
  A("intercambio-de-nombres", "Intercambio de nombres", "Durante 1 hora se presenta a todo el mundo con el nombre de otro jugador.", "social", "RARE", "🔄", 203),
  A("palabra-prohibida", "Palabra prohibida", "El grupo elige una palabra en su idioma. Cada vez que la diga, chupito o reto.", "idiomas", "RARE", "🚫", 204),
  A("guia-local", "Guía local", "Debe llevar al grupo a un sitio que nadie haya visitado, sin mirar el móvil.", "cultura", "RARE", "🧭", 205),
  A("duelo-internacional", "Duelo internacional", "Reta a alguien de otro país a un juego de bar. Si pierde, invita a la ronda.", "fiesta", "RARE", "🏓", 206),
  A("karaoke-poliglota", "Karaoke políglota", "Canta una canción en un idioma que no domine. La letra la eligen los demás.", "fiesta", "RARE", "🎤", 207),
  A("mini-clase", "Mini clase", "Enseña 5 palabras de su idioma (o de uno inventado) al grupo y hace examen.", "idiomas", "COMMON", "📚", 208),
  A("foto-erasmus", "Foto Erasmus", "Selfie con al menos 3 personas de nacionalidades distintas.", "social", "COMMON", "🤳", 209),
  A("brindis-multilingue", "Brindis multilingüe", "Brinda diciendo «salud» en 5 idiomas seguidos sin repetir.", "fiesta", "COMMON", "🍻", 210),
  A("chef-de-residencia", "Chef de residencia", "Cocina para el grupo con lo que haya en la nevera. Sin comprar nada.", "cultura", "COMMON", "🍳", 211),
  A("metedura-cultural", "Metedura cultural", "Cuenta su mayor metedura de pata cultural desde que llegó.", "social", "COMMON", "🙈", 212),
  A("moneda-local", "Moneda local", "Paga la siguiente ronda solo con monedas sueltas.", "fiesta", "COMMON", "🪙", 213),

  // Roadtrip
  A("copiloto-supremo", "Copiloto supremo", "Durante 2 horas decide música, paradas y ruta. Nadie puede protestar.", "carretera", "LEGENDARY", "🧑‍✈️", 300),
  A("parada-sorpresa", "Parada sorpresa", "El grupo tiene que parar en el próximo sitio raro que vea el jugador: mirador, bar de carretera o monumento absurdo.", "paradas", "LEGENDARY", "📍", 301),
  A("voz-del-gps", "Voz del GPS", "Durante 1 hora da todas las indicaciones con voz de GPS, incluidas las recalculaciones.", "carretera", "LEGENDARY", "🛰️", 302),
  A("playlist-maldita", "Playlist maldita", "Los demás eligen 5 canciones que el jugador tiene que cantar enteras.", "musica", "RARE", "📻", 303),
  A("radionovela", "Radionovela", "Narra en directo lo que pasa fuera de la ventana como locutor de radio durante 15 minutos.", "musica", "RARE", "🎙️", 304),
  A("ronda-de-gasolinera", "Ronda de gasolinera", "Invita a los snacks de todo el grupo en la próxima parada.", "paradas", "RARE", "⛽", 305),
  A("asiento-del-medio", "Asiento del medio", "Va en el asiento del medio hasta la próxima parada, sin quejas.", "carretera", "RARE", "🪑", 306),
  A("foto-de-carretera", "Foto de carretera", "Consigue una foto con un desconocido en la próxima gasolinera o área de servicio.", "paradas", "RARE", "📸", 307),
  A("veo-veo-extremo", "Veo veo extremo", "Si pierde 3 rondas de veo veo, castigo elegido por el grupo.", "juegos", "COMMON", "👀", 308),
  A("karaoke-de-coche", "Karaoke de coche", "Canta a pleno pulmón la próxima canción que suene, entera.", "musica", "COMMON", "🚗", 309),
  A("guardia-del-mapa", "Guardia del mapa", "Sin móvil, tiene que decir dónde estáis solo con señales y carteles.", "carretera", "COMMON", "🗺️", 310),
  A("brigada-de-limpieza", "Brigada de limpieza", "Recoge toda la basura del coche en la próxima parada.", "paradas", "COMMON", "🧹", 311),
  A("snack-sorpresa", "Snack sorpresa", "Se come el snack que elijan los demás en la gasolinera, sea el que sea.", "paradas", "COMMON", "🍫", 312),
  A("silencio-en-ruta", "Silencio en ruta", "20 minutos sin hablar. Cada palabra suma 5 minutos.", "carretera", "COMMON", "🤫", 313),

  // Familiar
  A("abuelo-por-un-dia", "Abuel@ por un día", "Durante 2 horas habla como el abuelo o la abuela de la familia y todos deben tratarle así.", "familia", "LEGENDARY", "👴", 400),
  A("chef-de-familia", "Chef de familia", "Cocina o elige y paga la próxima comida para toda la familia.", "cocina", "LEGENDARY", "👩‍🍳", 401),
  A("album-viviente", "Álbum viviente", "Recrea 3 fotos antiguas de la familia con quienes estén presentes.", "recuerdos", "LEGENDARY", "📷", 402),
  A("historia-familiar", "Historia familiar", "Cuenta una anécdota de la familia que los más pequeños no conozcan.", "recuerdos", "RARE", "📖", 403),
  A("fotografo-oficial", "Fotógraf@ oficial", "Hace todas las fotos del día y monta el resumen para el grupo de la familia.", "retos", "RARE", "🎞️", 404),
  A("elige-el-plan", "Elige el plan", "Decide la próxima actividad para todos, sin votaciones.", "decisiones", "RARE", "🗓️", 405),
  A("cargador-humano", "Cargador humano", "Lleva las mochilas y bolsas de todos hasta la próxima parada.", "retos", "RARE", "🎒", 406),
  A("dj-familiar", "DJ familiar", "Elige la música durante 1 hora, con al menos una canción de cada generación.", "familia", "RARE", "📀", 407),
  A("chiste-malo", "Chiste malo", "Cuenta un chiste. Si nadie se ríe, tiene que contar otro.", "retos", "COMMON", "🤡", 408),
  A("imitacion-familiar", "Imitación familiar", "Imita a un miembro de la familia hasta que adivinen quién es.", "familia", "COMMON", "🎭", 409),
  A("gracias-por", "Gracias por…", "Dice algo bonito de cada persona presente, mirándola a los ojos.", "familia", "COMMON", "💛", 410),
  A("foto-de-familia", "Foto de familia", "Organiza la foto de grupo con la pose que decida.", "recuerdos", "COMMON", "🖼️", 411),
  A("baile-familiar", "Baile familiar", "Baila 30 segundos donde estéis, con o sin música.", "retos", "COMMON", "💃", 412),
  A("sin-quejas", "Sin quejas", "1 hora entera sin quejarse de nada. Ni del calor.", "familia", "COMMON", "🙊", 413),

  // Kids
  A("rey-del-viaje", "Rey o Reina del viaje", "Durante 1 hora todos le llaman «su majestad» y elige el siguiente juego.", "magia", "LEGENDARY", "👑", 500),
  A("superheroe", "Superhéroe", "Inventa su nombre de superhéroe y sus poderes, y tiene que usarlos durante 1 hora.", "magia", "LEGENDARY", "🦸", 501),
  A("capitan-del-barco", "Capitán del barco", "Guía al grupo hasta la siguiente parada con una brújula imaginaria y órdenes de capitán.", "juegos", "LEGENDARY", "🧭", 502),
  { id: "capa-magica", name: "Capa mágica", description: "Bloqueas cualquier carta que te lancen. ¡La capa lo para todo!", kind: "REACTION", category: "defensa", rarity: "RARE", reactionEffect: "BLOCK", emoji: "🧙", sortOrder: 503 },
  { id: "espejo-magico", name: "Espejo mágico", description: "La carta rebota y le toca a quien la lanzó. No funciona contra otro espejo.", kind: "REACTION", category: "defensa", rarity: "RARE", reactionEffect: "REFLECT", emoji: "🪞", sortOrder: 504 },
  A("cuentacuentos", "Cuentacuentos", "Inventa un cuento de 1 minuto con 3 palabras que le digan los demás.", "juegos", "RARE", "📚", 505),
  A("cazador-de-colores", "Cazador de colores", "Encuentra 5 cosas del color que le digan antes de que cuenten hasta 30.", "juegos", "RARE", "🌈", 506),
  A("animal-secreto", "Animal secreto", "Se mueve y habla como un animal hasta que alguien adivine cuál es.", "retos", "RARE", "🐒", 507),
  A("baile-del-robot", "Baile del robot", "Baila como un robot durante 20 segundos.", "retos", "COMMON", "🤖", 508),
  A("risa-prohibida", "Risa prohibida", "Aguanta 1 minuto sin reírse mientras los demás hacen muecas.", "juegos", "COMMON", "😐", 509),
  A("abrazo-de-oso", "Abrazo de oso", "Da un abrazo de oso a cada jugador.", "retos", "COMMON", "🐻", 510),
  A("cancion-inventada", "Canción inventada", "Canta una canción inventada sobre lo que está viendo ahora mismo.", "retos", "COMMON", "🎵", 511),
  A("saltos-de-rana", "Saltos de rana", "Da 10 saltos de rana croando.", "retos", "COMMON", "🐸", 512),
  A("palabra-magica", "Palabra mágica", "Durante 30 minutos dice «por favor» y «gracias» con voz de mago.", "magia", "COMMON", "✨", 513),
  A("detective", "Detective", "Adivina qué objeto ha escondido el grupo con solo 5 preguntas.", "juegos", "COMMON", "🕵️", 514),

  // Pareja
  A("dia-a-tu-manera", "Día a tu manera", "La otra persona decide todo el plan de hoy y tú lo cumples sin protestar.", "complicidad", "LEGENDARY", "🗺️", 600),
  A("carta-publica", "Carta pública", "Escribe una carta de 5 líneas a la otra persona y léela en voz alta donde estéis.", "romantico", "LEGENDARY", "💌", 601),
  A("masaje-de-lujo", "Masaje de lujo", "15 minutos de masaje a la otra persona, sin quejas ni prisas.", "romantico", "LEGENDARY", "💆", 602),
  A("cita-sorpresa", "Cita sorpresa", "Organiza una cita improvisada en menos de 1 hora.", "complicidad", "RARE", "🌹", 603),
  A("foto-de-pelicula", "Foto de película", "Recread juntos el póster de una película romántica.", "retos", "RARE", "🎬", 604),
  A("veto-al-movil", "Veto al móvil", "2 horas sin móvil, salvo para haceros fotos juntos.", "decisiones", "RARE", "📵", 605),
  A("chef-invitado", "Chef invitado", "Elige el restaurante y pide el menú de la otra persona.", "decisiones", "RARE", "🍽️", 606),
  A("recuerdo-favorito", "Recuerdo favorito", "Cuenta tu recuerdo favorito con la otra persona y por qué lo es.", "romantico", "RARE", "💭", 607),
  A("piropo-cursi", "Piropo cursi", "El piropo más cursi que se te ocurra, dicho en público.", "retos", "COMMON", "🥰", 608),
  A("baile-lento", "Baile lento", "Bailad 1 minuto donde estéis, con o sin música.", "romantico", "COMMON", "🕺", 609),
  A("tres-cosas", "Tres cosas", "Tres cosas que admiras de la otra persona, sin repetir las de siempre.", "complicidad", "COMMON", "3️⃣", 610),
  A("foto-espontanea", "Foto espontánea", "Haz una foto a la otra persona sin que pose. La foto se queda.", "retos", "COMMON", "📸", 611),
  A("porteador", "Porteador", "Lleva la mochila o las bolsas de la otra persona hasta la próxima parada.", "retos", "COMMON", "🎒", 612),
  A("voz-cantante", "Voz cantante", "La otra persona pide y habla por ti durante la próxima comida.", "decisiones", "COMMON", "🗣️", 613),

  // Grupo Picante
  A("verdad-o-verdad", "Verdad o verdad", "Responde 3 preguntas del grupo sin mentir. Si se niega, chupito por cada una.", "confesiones", "LEGENDARY", "🔥", 700),
  A("mensaje-a-ciegas", "Mensaje a ciegas", "El grupo escribe un mensaje y lo envías al contacto que elijan, sin mirar antes.", "picante", "LEGENDARY", "📲", 701),
  A("historial-abierto", "Historial abierto", "Enseña las últimas 5 fotos del carrete o los 3 últimos chats. Elige el grupo.", "confesiones", "LEGENDARY", "🔓", 702),
  A("cita-desastrosa", "Cita desastrosa", "Cuenta la peor cita que hayas tenido, con todos los detalles.", "confesiones", "RARE", "💔", 703),
  A("frase-de-ligoteo", "Frase de ligoteo", "Usa la frase para ligar más mala que proponga el grupo con un desconocido.", "picante", "RARE", "😘", 704),
  A("baile-sensual", "Baile sensual", "30 segundos de baile sensual dedicados a quien diga el grupo.", "picante", "RARE", "💃", 705),
  A("ranking-del-grupo", "Ranking del grupo", "Ordena al grupo de más a menos ligón y explica cada puesto.", "confesiones", "RARE", "📊", 706),
  A("chupito-a-ciegas", "Chupito a ciegas", "El grupo prepara la mezcla. Tú te la bebes sin preguntar.", "bebida", "RARE", "🥃", 707),
  A("yo-nunca-solo", "Yo nunca, en solitario", "3 rondas de «yo nunca» en las que solo tú respondes.", "confesiones", "COMMON", "🙋", 708),
  A("resena-con-emojis", "Reseña con emojis", "Describe tu vida sentimental con 5 emojis y explícalos.", "confesiones", "COMMON", "😈", 709),
  A("piropo-a-desconocido", "Piropo a desconocido", "Dedica un piropo educado a alguien fuera del grupo.", "picante", "COMMON", "😉", 710),
  A("foto-picara", "Foto pícara", "Foto de grupo con la pose más sugerente que se pueda subir.", "picante", "COMMON", "📸", 711),
  A("crush-del-viaje", "Crush del viaje", "Confiesa quién te ha parecido más atractivo de las personas con las que os habéis cruzado hoy.", "confesiones", "COMMON", "👀", 712),
  A("prenda-menos", "Prenda menos", "Quítate un accesorio (gorra, reloj, chaqueta…) hasta la próxima parada.", "picante", "COMMON", "🧢", 713),
];

const CLASSIC = ["copa-tiron", "chupito-doble", "sin-manos", "cantar", "acento", "foto-ridicula", "invita-ronda", "cuenta-secreto", "sin-voto", "doble-voto", "ultra-voto", "movil-out", "comunista", "xokas", "freetour", "dj", "lola-lolita", "profeta", "hidalgo", "gorron", "abstemio", "escudo", "rebote", "robo", "a-comprar", "carrera"];
const DEFENSE = ["escudo", "rebote"];

export const CARD_PACKS: CardPackSeed[] = [
  { id: "clasico", name: "Clásico", description: "El mazo original: retos, bebida, roles y decisiones para cualquier viaje entre amigos.", emoji: "🃏", isPremium: false, sortOrder: 0, legendariesPerPlayer: 1, raresPerPlayer: 2, commonsPerPlayer: 2, responseWindowMinutes: 10, cardIds: CLASSIC },
  { id: "despedida", name: "Despedida de solter@", description: "Todo gira alrededor de quien se casa: guardaespaldas, discursos sorpresa y última noche libre.", emoji: "💍", isPremium: true, sortOrder: 10, legendariesPerPlayer: 1, raresPerPlayer: 2, commonsPerPlayer: 3, responseWindowMinutes: 10,
    cardIds: ["anillo-maldito", "discurso-sorpresa", "guardaespaldas", "tatuaje-temporal", "banda-sonora", "confesion-de-boda", "ligar-por-encargo", "ronda-de-honor", "pose-de-catalogo", "apodo-oficial", "brindis-obligado", "karaoke-express", "accesorio-ridiculo", "foto-con-cartel", "lola-lolita", "hidalgo", "copa-tiron", ...DEFENSE] },
  { id: "erasmus", name: "Erasmus", description: "Idiomas, culturas y fiesta internacional: embajadores, traductores y brindis en cinco lenguas.", emoji: "🌍", isPremium: true, sortOrder: 20, legendariesPerPlayer: 1, raresPerPlayer: 2, commonsPerPlayer: 3, responseWindowMinutes: 15,
    cardIds: ["traductor-oficial", "embajador", "anfitrion-internacional", "intercambio-de-nombres", "palabra-prohibida", "guia-local", "duelo-internacional", "karaoke-poliglota", "mini-clase", "foto-erasmus", "brindis-multilingue", "chef-de-residencia", "metedura-cultural", "moneda-local", "freetour", "acento", "invita-ronda", ...DEFENSE] },
  { id: "roadtrip", name: "Roadtrip", description: "Kilómetros, gasolineras y playlists: el copiloto manda y las paradas sorpresa son ley.", emoji: "🚗", isPremium: true, sortOrder: 30, legendariesPerPlayer: 1, raresPerPlayer: 2, commonsPerPlayer: 3, responseWindowMinutes: 20,
    cardIds: ["copiloto-supremo", "parada-sorpresa", "voz-del-gps", "playlist-maldita", "radionovela", "ronda-de-gasolinera", "asiento-del-medio", "foto-de-carretera", "veo-veo-extremo", "karaoke-de-coche", "guardia-del-mapa", "brigada-de-limpieza", "snack-sorpresa", "silencio-en-ruta", "dj", "carrera", "a-comprar", ...DEFENSE] },
  { id: "familiar", name: "Familiar", description: "Para todas las edades y sin alcohol: recuerdos, imitaciones, chistes malos y el chef de la familia.", emoji: "👨‍👩‍👧‍👦", isPremium: true, sortOrder: 40, legendariesPerPlayer: 1, raresPerPlayer: 2, commonsPerPlayer: 2, responseWindowMinutes: 30,
    cardIds: ["abuelo-por-un-dia", "chef-de-familia", "album-viviente", "historia-familiar", "fotografo-oficial", "elige-el-plan", "cargador-humano", "dj-familiar", "chiste-malo", "imitacion-familiar", "gracias-por", "foto-de-familia", "baile-familiar", "sin-quejas", "foto-ridicula", "cantar", ...DEFENSE] },
  { id: "kids", name: "Kids", description: "Reyes del viaje, superhéroes y capas mágicas: retos cortos y sencillos para los más pequeños.", emoji: "🧒", isPremium: true, sortOrder: 50, legendariesPerPlayer: 1, raresPerPlayer: 2, commonsPerPlayer: 3, responseWindowMinutes: 30,
    cardIds: ["rey-del-viaje", "superheroe", "capitan-del-barco", "capa-magica", "espejo-magico", "cuentacuentos", "cazador-de-colores", "animal-secreto", "baile-del-robot", "risa-prohibida", "abrazo-de-oso", "cancion-inventada", "saltos-de-rana", "palabra-magica", "detective"] },
  { id: "pareja", name: "Pareja", description: "Para dos: citas sorpresa, cartas públicas y un día entero a la manera de la otra persona.", emoji: "❤️", isPremium: true, sortOrder: 60, legendariesPerPlayer: 1, raresPerPlayer: 3, commonsPerPlayer: 3, responseWindowMinutes: 30,
    cardIds: ["dia-a-tu-manera", "carta-publica", "masaje-de-lujo", "cita-sorpresa", "foto-de-pelicula", "veto-al-movil", "chef-invitado", "recuerdo-favorito", "piropo-cursi", "baile-lento", "tres-cosas", "foto-espontanea", "porteador", "voz-cantante", "movil-out", "doble-voto", ...DEFENSE] },
  { id: "picante", name: "Grupo Picante", description: "Solo para mayores y con confianza: confesiones, mensajes a ciegas y chupitos a ciegas.", emoji: "🌶️", isPremium: true, sortOrder: 70, legendariesPerPlayer: 1, raresPerPlayer: 2, commonsPerPlayer: 3, responseWindowMinutes: 10,
    cardIds: ["verdad-o-verdad", "mensaje-a-ciegas", "historial-abierto", "cita-desastrosa", "frase-de-ligoteo", "baile-sensual", "ranking-del-grupo", "chupito-a-ciegas", "yo-nunca-solo", "resena-con-emojis", "piropo-a-desconocido", "foto-picara", "crush-del-viaje", "prenda-menos", "cuenta-secreto", "copa-tiron", "chupito-doble", ...DEFENSE] },
];
