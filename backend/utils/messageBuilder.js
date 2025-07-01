export function buildMainMenu() {
    return `
    מה תרצה לעשות?
    1️⃣ הוסף פודקאסט למעקב
    2️⃣ מחק פודקאסט ממעקב
    3️⃣ הוסף נושא למעקב
    4️⃣ מחק נושא ממעקב
    5️⃣ רשימת פודקאסטים שאני עוקב אחריהם
    6️⃣ רשימת נושאים שאני עוקב אחריהם
    7️⃣ רשימת 5 הזמרים שאני שומע הכי הרבה
    8️⃣ מחק אותי מהבוט
    9️⃣ עזרה
    
    *אנא שלח את המספר של הבחירה שלך.*
      `;
}

export function generateWelcomeMessage(authLink) {
  return `שלום! 👋 אני רואה שאתה חדש כאן, אני בוט שעוזר לך להתעדכן בפודקסטים שאתה אוהב דרך ספוטיפיי.
          אתה נותן לי שם של פודקסט שאתה אוהב ונושאים שאתה אוהב שעליהם מדברים בפוד ובכל פרק חדש
          של הפודקסט אעדכן אותך אם הנושא דובר בפרק ואתן תקציר.
          בנוסף תוכל לקבל דרכי מידע על השימוש שלך בספוטיפיי, כמו מה הפודקסטים שאתה מאזין להם הכי הרבה.
          אחרי שתתחבר לשירות בכל רגע נתון תוכל לשלוח 'עזרה' כדי לחזור לתפריט הראשי.
          כדי להתחבר לשירות אני צריך שתאשר לי לגשת למידע שלך בספוטיפיי(רק מידע שקשור לספוטיפיי ישירות)
          אני שולח לך עכשיו קישור, זה ייקח אותך לאתר של ספוטיפיי עם בקשה ממני להתחבר למידע שלך
          אחרי שתאשר תחזור לכאן ונמשיך\n ${authLink}`;
}

export function generateProblemAuthMessage(authLink) {
  return "נראה שהיה בעיה בהתחברות. אני שולח לך לינק חדש -\n" + authLink;
}

export function generatePodcastListMessage(podcasts) {
  if (podcasts.length === 0) {
    return "אין לך פודקאסטים במעקב.";
  }
  return `הפודקאסטים שאתה עוקב אחריהם:\n${podcasts.map((p, i) => `*${i + 1}* - *${p.title}*`).join('\n')}`;
}

export function generateTopicsListMessage(topics) {
  if (topics.length === 0) {
    return "אין לך נושאים במעקב.";
  }
  return `הנושאים שאתה עוקב אחריהם:\n${topics.map((t, i) => `*${i + 1}* - *${t.name}*`).join('\n')}`;
}

export function generateTopArtistsMessage(topArtists) {
  if (topArtists.length === 0) {
    return "אין לך זמרים שאתה מאזין להם.";
  }
  return `הזמרים שאתה מאזין להם הכי הרבה:\n${topArtists.map((a, i) => `*${i + 1}* - *${a.name}*`).join('\n')}`;
}

export function generateHelpMessage() {
  return `בתפריט הראשי ליד כל אופציה יש מספר, תבחר מה אתה רוצה לעשות ותשלח לי את המספר שלידו.\n
        בכל שלב אתה יכול לשלוח 'עזרה' כדי לחזור לתפריט הראשי.`
}

export function generateNewEpisodeMessage(podcast, episode, matchingTopics) {
  return `לפודקסט *${podcast.title}* יצא פרק חדש שמתאים לנושאים שלך:\n` +
         `נושאים: ${matchingTopics.join(", ")}\n` +
         `שם הפרק: *${episode.name}*\n` +
         `תיאור הפרק: ${episode.description}\n` +
         `לינק לפרק: https://open.spotify.com/episode/${episode.id}`;
}

export function generateRemovePodcastListMessage(podcasts) {
  if (podcasts.length === 0) {
    return "אין לך פודקאסטים במעקב.";
  }
  return `איזה פודקאסט אתה רוצה להסיר? שלח לי את המספר שליד הפודקאסט:\n` +
         `${podcasts.map((p, i) => `*${i + 1}* - *${p.title}*`).join('\n')}`;
}