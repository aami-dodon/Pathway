import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('subscriber', 'creator', 'coach', 'admin');
  CREATE TYPE "public"."enum_media_category" AS ENUM('images', 'videos', 'documents');
  CREATE TYPE "public"."enum_coach_profiles_availability_day" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum_coach_profiles_timezone" AS ENUM('UTC', 'Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa', 'Africa/Algiers', 'Africa/Asmera', 'Africa/Bamako', 'Africa/Bangui', 'Africa/Banjul', 'Africa/Bissau', 'Africa/Blantyre', 'Africa/Brazzaville', 'Africa/Bujumbura', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Ceuta', 'Africa/Conakry', 'Africa/Dakar', 'Africa/Dar_es_Salaam', 'Africa/Djibouti', 'Africa/Douala', 'Africa/El_Aaiun', 'Africa/Freetown', 'Africa/Gaborone', 'Africa/Harare', 'Africa/Johannesburg', 'Africa/Juba', 'Africa/Kampala', 'Africa/Khartoum', 'Africa/Kigali', 'Africa/Kinshasa', 'Africa/Lagos', 'Africa/Libreville', 'Africa/Lome', 'Africa/Luanda', 'Africa/Lubumbashi', 'Africa/Lusaka', 'Africa/Malabo', 'Africa/Maputo', 'Africa/Maseru', 'Africa/Mbabane', 'Africa/Mogadishu', 'Africa/Monrovia', 'Africa/Nairobi', 'Africa/Ndjamena', 'Africa/Niamey', 'Africa/Nouakchott', 'Africa/Ouagadougou', 'Africa/Porto-Novo', 'Africa/Sao_Tome', 'Africa/Tripoli', 'Africa/Tunis', 'Africa/Windhoek', 'America/Adak', 'America/Anchorage', 'America/Anguilla', 'America/Antigua', 'America/Araguaina', 'America/Argentina/La_Rioja', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta', 'America/Argentina/San_Juan', 'America/Argentina/San_Luis', 'America/Argentina/Tucuman', 'America/Argentina/Ushuaia', 'America/Aruba', 'America/Asuncion', 'America/Bahia', 'America/Bahia_Banderas', 'America/Barbados', 'America/Belem', 'America/Belize', 'America/Blanc-Sablon', 'America/Boa_Vista', 'America/Bogota', 'America/Boise', 'America/Buenos_Aires', 'America/Cambridge_Bay', 'America/Campo_Grande', 'America/Cancun', 'America/Caracas', 'America/Catamarca', 'America/Cayenne', 'America/Cayman', 'America/Chicago', 'America/Chihuahua', 'America/Ciudad_Juarez', 'America/Coral_Harbour', 'America/Cordoba', 'America/Costa_Rica', 'America/Coyhaique', 'America/Creston', 'America/Cuiaba', 'America/Curacao', 'America/Danmarkshavn', 'America/Dawson', 'America/Dawson_Creek', 'America/Denver', 'America/Detroit', 'America/Dominica', 'America/Edmonton', 'America/Eirunepe', 'America/El_Salvador', 'America/Fort_Nelson', 'America/Fortaleza', 'America/Glace_Bay', 'America/Godthab', 'America/Goose_Bay', 'America/Grand_Turk', 'America/Grenada', 'America/Guadeloupe', 'America/Guatemala', 'America/Guayaquil', 'America/Guyana', 'America/Halifax', 'America/Havana', 'America/Hermosillo', 'America/Indiana/Knox', 'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Tell_City', 'America/Indiana/Vevay', 'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Indianapolis', 'America/Inuvik', 'America/Iqaluit', 'America/Jamaica', 'America/Jujuy', 'America/Juneau', 'America/Kentucky/Monticello', 'America/Kralendijk', 'America/La_Paz', 'America/Lima', 'America/Los_Angeles', 'America/Louisville', 'America/Lower_Princes', 'America/Maceio', 'America/Managua', 'America/Manaus', 'America/Marigot', 'America/Martinique', 'America/Matamoros', 'America/Mazatlan', 'America/Mendoza', 'America/Menominee', 'America/Merida', 'America/Metlakatla', 'America/Mexico_City', 'America/Miquelon', 'America/Moncton', 'America/Monterrey', 'America/Montevideo', 'America/Montserrat', 'America/Nassau', 'America/New_York', 'America/Nome', 'America/Noronha', 'America/North_Dakota/Beulah', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem', 'America/Ojinaga', 'America/Panama', 'America/Paramaribo', 'America/Phoenix', 'America/Port-au-Prince', 'America/Port_of_Spain', 'America/Porto_Velho', 'America/Puerto_Rico', 'America/Punta_Arenas', 'America/Rankin_Inlet', 'America/Recife', 'America/Regina', 'America/Resolute', 'America/Rio_Branco', 'America/Santarem', 'America/Santiago', 'America/Santo_Domingo', 'America/Sao_Paulo', 'America/Scoresbysund', 'America/Sitka', 'America/St_Barthelemy', 'America/St_Johns', 'America/St_Kitts', 'America/St_Lucia', 'America/St_Thomas', 'America/St_Vincent', 'America/Swift_Current', 'America/Tegucigalpa', 'America/Thule', 'America/Tijuana', 'America/Toronto', 'America/Tortola', 'America/Vancouver', 'America/Whitehorse', 'America/Winnipeg', 'America/Yakutat', 'Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/DumontDUrville', 'Antarctica/Macquarie', 'Antarctica/Mawson', 'Antarctica/McMurdo', 'Antarctica/Palmer', 'Antarctica/Rothera', 'Antarctica/Syowa', 'Antarctica/Troll', 'Antarctica/Vostok', 'Arctic/Longyearbyen', 'Asia/Aden', 'Asia/Almaty', 'Asia/Amman', 'Asia/Anadyr', 'Asia/Aqtau', 'Asia/Aqtobe', 'Asia/Ashgabat', 'Asia/Atyrau', 'Asia/Baghdad', 'Asia/Bahrain', 'Asia/Baku', 'Asia/Bangkok', 'Asia/Barnaul', 'Asia/Beirut', 'Asia/Bishkek', 'Asia/Brunei', 'Asia/Calcutta', 'Asia/Chita', 'Asia/Colombo', 'Asia/Damascus', 'Asia/Dhaka', 'Asia/Dili', 'Asia/Dubai', 'Asia/Dushanbe', 'Asia/Famagusta', 'Asia/Gaza', 'Asia/Hebron', 'Asia/Hong_Kong', 'Asia/Hovd', 'Asia/Irkutsk', 'Asia/Jakarta', 'Asia/Jayapura', 'Asia/Jerusalem', 'Asia/Kabul', 'Asia/Kamchatka', 'Asia/Karachi', 'Asia/Katmandu', 'Asia/Khandyga', 'Asia/Krasnoyarsk', 'Asia/Kuala_Lumpur', 'Asia/Kuching', 'Asia/Kuwait', 'Asia/Macau', 'Asia/Magadan', 'Asia/Makassar', 'Asia/Manila', 'Asia/Muscat', 'Asia/Nicosia', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Omsk', 'Asia/Oral', 'Asia/Phnom_Penh', 'Asia/Pontianak', 'Asia/Pyongyang', 'Asia/Qatar', 'Asia/Qostanay', 'Asia/Qyzylorda', 'Asia/Rangoon', 'Asia/Riyadh', 'Asia/Saigon', 'Asia/Sakhalin', 'Asia/Samarkand', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Srednekolymsk', 'Asia/Taipei', 'Asia/Tashkent', 'Asia/Tbilisi', 'Asia/Tehran', 'Asia/Thimphu', 'Asia/Tokyo', 'Asia/Tomsk', 'Asia/Ulaanbaatar', 'Asia/Urumqi', 'Asia/Ust-Nera', 'Asia/Vientiane', 'Asia/Vladivostok', 'Asia/Yakutsk', 'Asia/Yekaterinburg', 'Asia/Yerevan', 'Atlantic/Azores', 'Atlantic/Bermuda', 'Atlantic/Canary', 'Atlantic/Cape_Verde', 'Atlantic/Faeroe', 'Atlantic/Madeira', 'Atlantic/Reykjavik', 'Atlantic/South_Georgia', 'Atlantic/St_Helena', 'Atlantic/Stanley', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill', 'Australia/Darwin', 'Australia/Eucla', 'Australia/Hobart', 'Australia/Lindeman', 'Australia/Lord_Howe', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney', 'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Astrakhan', 'Europe/Athens', 'Europe/Belgrade', 'Europe/Berlin', 'Europe/Bratislava', 'Europe/Brussels', 'Europe/Bucharest', 'Europe/Budapest', 'Europe/Busingen', 'Europe/Chisinau', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Gibraltar', 'Europe/Guernsey', 'Europe/Helsinki', 'Europe/Isle_of_Man', 'Europe/Istanbul', 'Europe/Jersey', 'Europe/Kaliningrad', 'Europe/Kiev', 'Europe/Kirov', 'Europe/Lisbon', 'Europe/Ljubljana', 'Europe/London', 'Europe/Luxembourg', 'Europe/Madrid', 'Europe/Malta', 'Europe/Mariehamn', 'Europe/Minsk', 'Europe/Monaco', 'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Podgorica', 'Europe/Prague', 'Europe/Riga', 'Europe/Rome', 'Europe/Samara', 'Europe/San_Marino', 'Europe/Sarajevo', 'Europe/Saratov', 'Europe/Simferopol', 'Europe/Skopje', 'Europe/Sofia', 'Europe/Stockholm', 'Europe/Tallinn', 'Europe/Tirane', 'Europe/Ulyanovsk', 'Europe/Vaduz', 'Europe/Vatican', 'Europe/Vienna', 'Europe/Vilnius', 'Europe/Volgograd', 'Europe/Warsaw', 'Europe/Zagreb', 'Europe/Zurich', 'Indian/Antananarivo', 'Indian/Chagos', 'Indian/Christmas', 'Indian/Cocos', 'Indian/Comoro', 'Indian/Kerguelen', 'Indian/Mahe', 'Indian/Maldives', 'Indian/Mauritius', 'Indian/Mayotte', 'Indian/Reunion', 'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville', 'Pacific/Chatham', 'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury', 'Pacific/Fakaofo', 'Pacific/Fiji', 'Pacific/Funafuti', 'Pacific/Galapagos', 'Pacific/Gambier', 'Pacific/Guadalcanal', 'Pacific/Guam', 'Pacific/Honolulu', 'Pacific/Kiritimati', 'Pacific/Kosrae', 'Pacific/Kwajalein', 'Pacific/Majuro', 'Pacific/Marquesas', 'Pacific/Midway', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Norfolk', 'Pacific/Noumea', 'Pacific/Pago_Pago', 'Pacific/Palau', 'Pacific/Pitcairn', 'Pacific/Ponape', 'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Saipan', 'Pacific/Tahiti', 'Pacific/Tarawa', 'Pacific/Tongatapu', 'Pacific/Truk', 'Pacific/Wake', 'Pacific/Wallis');
  CREATE TYPE "public"."enum_subscriber_profiles_metadata_timezone" AS ENUM('UTC', 'Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa', 'Africa/Algiers', 'Africa/Asmera', 'Africa/Bamako', 'Africa/Bangui', 'Africa/Banjul', 'Africa/Bissau', 'Africa/Blantyre', 'Africa/Brazzaville', 'Africa/Bujumbura', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Ceuta', 'Africa/Conakry', 'Africa/Dakar', 'Africa/Dar_es_Salaam', 'Africa/Djibouti', 'Africa/Douala', 'Africa/El_Aaiun', 'Africa/Freetown', 'Africa/Gaborone', 'Africa/Harare', 'Africa/Johannesburg', 'Africa/Juba', 'Africa/Kampala', 'Africa/Khartoum', 'Africa/Kigali', 'Africa/Kinshasa', 'Africa/Lagos', 'Africa/Libreville', 'Africa/Lome', 'Africa/Luanda', 'Africa/Lubumbashi', 'Africa/Lusaka', 'Africa/Malabo', 'Africa/Maputo', 'Africa/Maseru', 'Africa/Mbabane', 'Africa/Mogadishu', 'Africa/Monrovia', 'Africa/Nairobi', 'Africa/Ndjamena', 'Africa/Niamey', 'Africa/Nouakchott', 'Africa/Ouagadougou', 'Africa/Porto-Novo', 'Africa/Sao_Tome', 'Africa/Tripoli', 'Africa/Tunis', 'Africa/Windhoek', 'America/Adak', 'America/Anchorage', 'America/Anguilla', 'America/Antigua', 'America/Araguaina', 'America/Argentina/La_Rioja', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta', 'America/Argentina/San_Juan', 'America/Argentina/San_Luis', 'America/Argentina/Tucuman', 'America/Argentina/Ushuaia', 'America/Aruba', 'America/Asuncion', 'America/Bahia', 'America/Bahia_Banderas', 'America/Barbados', 'America/Belem', 'America/Belize', 'America/Blanc-Sablon', 'America/Boa_Vista', 'America/Bogota', 'America/Boise', 'America/Buenos_Aires', 'America/Cambridge_Bay', 'America/Campo_Grande', 'America/Cancun', 'America/Caracas', 'America/Catamarca', 'America/Cayenne', 'America/Cayman', 'America/Chicago', 'America/Chihuahua', 'America/Ciudad_Juarez', 'America/Coral_Harbour', 'America/Cordoba', 'America/Costa_Rica', 'America/Coyhaique', 'America/Creston', 'America/Cuiaba', 'America/Curacao', 'America/Danmarkshavn', 'America/Dawson', 'America/Dawson_Creek', 'America/Denver', 'America/Detroit', 'America/Dominica', 'America/Edmonton', 'America/Eirunepe', 'America/El_Salvador', 'America/Fort_Nelson', 'America/Fortaleza', 'America/Glace_Bay', 'America/Godthab', 'America/Goose_Bay', 'America/Grand_Turk', 'America/Grenada', 'America/Guadeloupe', 'America/Guatemala', 'America/Guayaquil', 'America/Guyana', 'America/Halifax', 'America/Havana', 'America/Hermosillo', 'America/Indiana/Knox', 'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Tell_City', 'America/Indiana/Vevay', 'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Indianapolis', 'America/Inuvik', 'America/Iqaluit', 'America/Jamaica', 'America/Jujuy', 'America/Juneau', 'America/Kentucky/Monticello', 'America/Kralendijk', 'America/La_Paz', 'America/Lima', 'America/Los_Angeles', 'America/Louisville', 'America/Lower_Princes', 'America/Maceio', 'America/Managua', 'America/Manaus', 'America/Marigot', 'America/Martinique', 'America/Matamoros', 'America/Mazatlan', 'America/Mendoza', 'America/Menominee', 'America/Merida', 'America/Metlakatla', 'America/Mexico_City', 'America/Miquelon', 'America/Moncton', 'America/Monterrey', 'America/Montevideo', 'America/Montserrat', 'America/Nassau', 'America/New_York', 'America/Nome', 'America/Noronha', 'America/North_Dakota/Beulah', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem', 'America/Ojinaga', 'America/Panama', 'America/Paramaribo', 'America/Phoenix', 'America/Port-au-Prince', 'America/Port_of_Spain', 'America/Porto_Velho', 'America/Puerto_Rico', 'America/Punta_Arenas', 'America/Rankin_Inlet', 'America/Recife', 'America/Regina', 'America/Resolute', 'America/Rio_Branco', 'America/Santarem', 'America/Santiago', 'America/Santo_Domingo', 'America/Sao_Paulo', 'America/Scoresbysund', 'America/Sitka', 'America/St_Barthelemy', 'America/St_Johns', 'America/St_Kitts', 'America/St_Lucia', 'America/St_Thomas', 'America/St_Vincent', 'America/Swift_Current', 'America/Tegucigalpa', 'America/Thule', 'America/Tijuana', 'America/Toronto', 'America/Tortola', 'America/Vancouver', 'America/Whitehorse', 'America/Winnipeg', 'America/Yakutat', 'Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/DumontDUrville', 'Antarctica/Macquarie', 'Antarctica/Mawson', 'Antarctica/McMurdo', 'Antarctica/Palmer', 'Antarctica/Rothera', 'Antarctica/Syowa', 'Antarctica/Troll', 'Antarctica/Vostok', 'Arctic/Longyearbyen', 'Asia/Aden', 'Asia/Almaty', 'Asia/Amman', 'Asia/Anadyr', 'Asia/Aqtau', 'Asia/Aqtobe', 'Asia/Ashgabat', 'Asia/Atyrau', 'Asia/Baghdad', 'Asia/Bahrain', 'Asia/Baku', 'Asia/Bangkok', 'Asia/Barnaul', 'Asia/Beirut', 'Asia/Bishkek', 'Asia/Brunei', 'Asia/Calcutta', 'Asia/Chita', 'Asia/Colombo', 'Asia/Damascus', 'Asia/Dhaka', 'Asia/Dili', 'Asia/Dubai', 'Asia/Dushanbe', 'Asia/Famagusta', 'Asia/Gaza', 'Asia/Hebron', 'Asia/Hong_Kong', 'Asia/Hovd', 'Asia/Irkutsk', 'Asia/Jakarta', 'Asia/Jayapura', 'Asia/Jerusalem', 'Asia/Kabul', 'Asia/Kamchatka', 'Asia/Karachi', 'Asia/Katmandu', 'Asia/Khandyga', 'Asia/Krasnoyarsk', 'Asia/Kuala_Lumpur', 'Asia/Kuching', 'Asia/Kuwait', 'Asia/Macau', 'Asia/Magadan', 'Asia/Makassar', 'Asia/Manila', 'Asia/Muscat', 'Asia/Nicosia', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Omsk', 'Asia/Oral', 'Asia/Phnom_Penh', 'Asia/Pontianak', 'Asia/Pyongyang', 'Asia/Qatar', 'Asia/Qostanay', 'Asia/Qyzylorda', 'Asia/Rangoon', 'Asia/Riyadh', 'Asia/Saigon', 'Asia/Sakhalin', 'Asia/Samarkand', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Srednekolymsk', 'Asia/Taipei', 'Asia/Tashkent', 'Asia/Tbilisi', 'Asia/Tehran', 'Asia/Thimphu', 'Asia/Tokyo', 'Asia/Tomsk', 'Asia/Ulaanbaatar', 'Asia/Urumqi', 'Asia/Ust-Nera', 'Asia/Vientiane', 'Asia/Vladivostok', 'Asia/Yakutsk', 'Asia/Yekaterinburg', 'Asia/Yerevan', 'Atlantic/Azores', 'Atlantic/Bermuda', 'Atlantic/Canary', 'Atlantic/Cape_Verde', 'Atlantic/Faeroe', 'Atlantic/Madeira', 'Atlantic/Reykjavik', 'Atlantic/South_Georgia', 'Atlantic/St_Helena', 'Atlantic/Stanley', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill', 'Australia/Darwin', 'Australia/Eucla', 'Australia/Hobart', 'Australia/Lindeman', 'Australia/Lord_Howe', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney', 'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Astrakhan', 'Europe/Athens', 'Europe/Belgrade', 'Europe/Berlin', 'Europe/Bratislava', 'Europe/Brussels', 'Europe/Bucharest', 'Europe/Budapest', 'Europe/Busingen', 'Europe/Chisinau', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Gibraltar', 'Europe/Guernsey', 'Europe/Helsinki', 'Europe/Isle_of_Man', 'Europe/Istanbul', 'Europe/Jersey', 'Europe/Kaliningrad', 'Europe/Kiev', 'Europe/Kirov', 'Europe/Lisbon', 'Europe/Ljubljana', 'Europe/London', 'Europe/Luxembourg', 'Europe/Madrid', 'Europe/Malta', 'Europe/Mariehamn', 'Europe/Minsk', 'Europe/Monaco', 'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Podgorica', 'Europe/Prague', 'Europe/Riga', 'Europe/Rome', 'Europe/Samara', 'Europe/San_Marino', 'Europe/Sarajevo', 'Europe/Saratov', 'Europe/Simferopol', 'Europe/Skopje', 'Europe/Sofia', 'Europe/Stockholm', 'Europe/Tallinn', 'Europe/Tirane', 'Europe/Ulyanovsk', 'Europe/Vaduz', 'Europe/Vatican', 'Europe/Vienna', 'Europe/Vilnius', 'Europe/Volgograd', 'Europe/Warsaw', 'Europe/Zagreb', 'Europe/Zurich', 'Indian/Antananarivo', 'Indian/Chagos', 'Indian/Christmas', 'Indian/Cocos', 'Indian/Comoro', 'Indian/Kerguelen', 'Indian/Mahe', 'Indian/Maldives', 'Indian/Mauritius', 'Indian/Mayotte', 'Indian/Reunion', 'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville', 'Pacific/Chatham', 'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury', 'Pacific/Fakaofo', 'Pacific/Fiji', 'Pacific/Funafuti', 'Pacific/Galapagos', 'Pacific/Gambier', 'Pacific/Guadalcanal', 'Pacific/Guam', 'Pacific/Honolulu', 'Pacific/Kiritimati', 'Pacific/Kosrae', 'Pacific/Kwajalein', 'Pacific/Majuro', 'Pacific/Marquesas', 'Pacific/Midway', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Norfolk', 'Pacific/Noumea', 'Pacific/Pago_Pago', 'Pacific/Palau', 'Pacific/Pitcairn', 'Pacific/Ponape', 'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Saipan', 'Pacific/Tahiti', 'Pacific/Tarawa', 'Pacific/Tongatapu', 'Pacific/Truk', 'Pacific/Wake', 'Pacific/Wallis');
  CREATE TYPE "public"."enum_subscriber_profiles_learning_preferences_preferred_format" AS ENUM('video', 'text', 'audio', 'interactive');
  CREATE TYPE "public"."enum_subscriber_profiles_learning_preferences_pace" AS ENUM('self-paced', 'scheduled', 'intensive');
  CREATE TYPE "public"."enum_courses_difficulty" AS ENUM('beginner', 'intermediate', 'advanced', 'all-levels');
  CREATE TYPE "public"."enum_lessons_type" AS ENUM('video', 'text', 'audio', 'interactive', 'assignment', 'quiz', 'live', 'download');
  CREATE TYPE "public"."enum_lessons_assignment_content_submission_type" AS ENUM('file', 'text', 'link');
  CREATE TYPE "public"."enum_lessons_completion_criteria" AS ENUM('view', 'video-complete', 'quiz-pass', 'assignment-submit', 'manual');
  CREATE TYPE "public"."enum_quizzes_questions_question_type" AS ENUM('multiple-choice', 'multiple-select', 'true-false', 'short-answer', 'essay', 'fill-blank');
  CREATE TYPE "public"."enum_quizzes_settings_show_correct_answers" AS ENUM('never', 'after-submit', 'after-pass', 'after-attempts');
  CREATE TYPE "public"."enum_enrollments_status" AS ENUM('active', 'completed', 'paused', 'expired', 'cancelled');
  CREATE TYPE "public"."enum_progress_status" AS ENUM('not-started', 'in-progress', 'completed', 'skipped');
  CREATE TYPE "public"."enum_quiz_attempts_status" AS ENUM('in-progress', 'submitted', 'graded', 'expired');
  CREATE TYPE "public"."enum_coaching_sessions_timezone" AS ENUM('UTC', 'Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa', 'Africa/Algiers', 'Africa/Asmera', 'Africa/Bamako', 'Africa/Bangui', 'Africa/Banjul', 'Africa/Bissau', 'Africa/Blantyre', 'Africa/Brazzaville', 'Africa/Bujumbura', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Ceuta', 'Africa/Conakry', 'Africa/Dakar', 'Africa/Dar_es_Salaam', 'Africa/Djibouti', 'Africa/Douala', 'Africa/El_Aaiun', 'Africa/Freetown', 'Africa/Gaborone', 'Africa/Harare', 'Africa/Johannesburg', 'Africa/Juba', 'Africa/Kampala', 'Africa/Khartoum', 'Africa/Kigali', 'Africa/Kinshasa', 'Africa/Lagos', 'Africa/Libreville', 'Africa/Lome', 'Africa/Luanda', 'Africa/Lubumbashi', 'Africa/Lusaka', 'Africa/Malabo', 'Africa/Maputo', 'Africa/Maseru', 'Africa/Mbabane', 'Africa/Mogadishu', 'Africa/Monrovia', 'Africa/Nairobi', 'Africa/Ndjamena', 'Africa/Niamey', 'Africa/Nouakchott', 'Africa/Ouagadougou', 'Africa/Porto-Novo', 'Africa/Sao_Tome', 'Africa/Tripoli', 'Africa/Tunis', 'Africa/Windhoek', 'America/Adak', 'America/Anchorage', 'America/Anguilla', 'America/Antigua', 'America/Araguaina', 'America/Argentina/La_Rioja', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta', 'America/Argentina/San_Juan', 'America/Argentina/San_Luis', 'America/Argentina/Tucuman', 'America/Argentina/Ushuaia', 'America/Aruba', 'America/Asuncion', 'America/Bahia', 'America/Bahia_Banderas', 'America/Barbados', 'America/Belem', 'America/Belize', 'America/Blanc-Sablon', 'America/Boa_Vista', 'America/Bogota', 'America/Boise', 'America/Buenos_Aires', 'America/Cambridge_Bay', 'America/Campo_Grande', 'America/Cancun', 'America/Caracas', 'America/Catamarca', 'America/Cayenne', 'America/Cayman', 'America/Chicago', 'America/Chihuahua', 'America/Ciudad_Juarez', 'America/Coral_Harbour', 'America/Cordoba', 'America/Costa_Rica', 'America/Coyhaique', 'America/Creston', 'America/Cuiaba', 'America/Curacao', 'America/Danmarkshavn', 'America/Dawson', 'America/Dawson_Creek', 'America/Denver', 'America/Detroit', 'America/Dominica', 'America/Edmonton', 'America/Eirunepe', 'America/El_Salvador', 'America/Fort_Nelson', 'America/Fortaleza', 'America/Glace_Bay', 'America/Godthab', 'America/Goose_Bay', 'America/Grand_Turk', 'America/Grenada', 'America/Guadeloupe', 'America/Guatemala', 'America/Guayaquil', 'America/Guyana', 'America/Halifax', 'America/Havana', 'America/Hermosillo', 'America/Indiana/Knox', 'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Tell_City', 'America/Indiana/Vevay', 'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Indianapolis', 'America/Inuvik', 'America/Iqaluit', 'America/Jamaica', 'America/Jujuy', 'America/Juneau', 'America/Kentucky/Monticello', 'America/Kralendijk', 'America/La_Paz', 'America/Lima', 'America/Los_Angeles', 'America/Louisville', 'America/Lower_Princes', 'America/Maceio', 'America/Managua', 'America/Manaus', 'America/Marigot', 'America/Martinique', 'America/Matamoros', 'America/Mazatlan', 'America/Mendoza', 'America/Menominee', 'America/Merida', 'America/Metlakatla', 'America/Mexico_City', 'America/Miquelon', 'America/Moncton', 'America/Monterrey', 'America/Montevideo', 'America/Montserrat', 'America/Nassau', 'America/New_York', 'America/Nome', 'America/Noronha', 'America/North_Dakota/Beulah', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem', 'America/Ojinaga', 'America/Panama', 'America/Paramaribo', 'America/Phoenix', 'America/Port-au-Prince', 'America/Port_of_Spain', 'America/Porto_Velho', 'America/Puerto_Rico', 'America/Punta_Arenas', 'America/Rankin_Inlet', 'America/Recife', 'America/Regina', 'America/Resolute', 'America/Rio_Branco', 'America/Santarem', 'America/Santiago', 'America/Santo_Domingo', 'America/Sao_Paulo', 'America/Scoresbysund', 'America/Sitka', 'America/St_Barthelemy', 'America/St_Johns', 'America/St_Kitts', 'America/St_Lucia', 'America/St_Thomas', 'America/St_Vincent', 'America/Swift_Current', 'America/Tegucigalpa', 'America/Thule', 'America/Tijuana', 'America/Toronto', 'America/Tortola', 'America/Vancouver', 'America/Whitehorse', 'America/Winnipeg', 'America/Yakutat', 'Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/DumontDUrville', 'Antarctica/Macquarie', 'Antarctica/Mawson', 'Antarctica/McMurdo', 'Antarctica/Palmer', 'Antarctica/Rothera', 'Antarctica/Syowa', 'Antarctica/Troll', 'Antarctica/Vostok', 'Arctic/Longyearbyen', 'Asia/Aden', 'Asia/Almaty', 'Asia/Amman', 'Asia/Anadyr', 'Asia/Aqtau', 'Asia/Aqtobe', 'Asia/Ashgabat', 'Asia/Atyrau', 'Asia/Baghdad', 'Asia/Bahrain', 'Asia/Baku', 'Asia/Bangkok', 'Asia/Barnaul', 'Asia/Beirut', 'Asia/Bishkek', 'Asia/Brunei', 'Asia/Calcutta', 'Asia/Chita', 'Asia/Colombo', 'Asia/Damascus', 'Asia/Dhaka', 'Asia/Dili', 'Asia/Dubai', 'Asia/Dushanbe', 'Asia/Famagusta', 'Asia/Gaza', 'Asia/Hebron', 'Asia/Hong_Kong', 'Asia/Hovd', 'Asia/Irkutsk', 'Asia/Jakarta', 'Asia/Jayapura', 'Asia/Jerusalem', 'Asia/Kabul', 'Asia/Kamchatka', 'Asia/Karachi', 'Asia/Katmandu', 'Asia/Khandyga', 'Asia/Krasnoyarsk', 'Asia/Kuala_Lumpur', 'Asia/Kuching', 'Asia/Kuwait', 'Asia/Macau', 'Asia/Magadan', 'Asia/Makassar', 'Asia/Manila', 'Asia/Muscat', 'Asia/Nicosia', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Omsk', 'Asia/Oral', 'Asia/Phnom_Penh', 'Asia/Pontianak', 'Asia/Pyongyang', 'Asia/Qatar', 'Asia/Qostanay', 'Asia/Qyzylorda', 'Asia/Rangoon', 'Asia/Riyadh', 'Asia/Saigon', 'Asia/Sakhalin', 'Asia/Samarkand', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Srednekolymsk', 'Asia/Taipei', 'Asia/Tashkent', 'Asia/Tbilisi', 'Asia/Tehran', 'Asia/Thimphu', 'Asia/Tokyo', 'Asia/Tomsk', 'Asia/Ulaanbaatar', 'Asia/Urumqi', 'Asia/Ust-Nera', 'Asia/Vientiane', 'Asia/Vladivostok', 'Asia/Yakutsk', 'Asia/Yekaterinburg', 'Asia/Yerevan', 'Atlantic/Azores', 'Atlantic/Bermuda', 'Atlantic/Canary', 'Atlantic/Cape_Verde', 'Atlantic/Faeroe', 'Atlantic/Madeira', 'Atlantic/Reykjavik', 'Atlantic/South_Georgia', 'Atlantic/St_Helena', 'Atlantic/Stanley', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill', 'Australia/Darwin', 'Australia/Eucla', 'Australia/Hobart', 'Australia/Lindeman', 'Australia/Lord_Howe', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney', 'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Astrakhan', 'Europe/Athens', 'Europe/Belgrade', 'Europe/Berlin', 'Europe/Bratislava', 'Europe/Brussels', 'Europe/Bucharest', 'Europe/Budapest', 'Europe/Busingen', 'Europe/Chisinau', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Gibraltar', 'Europe/Guernsey', 'Europe/Helsinki', 'Europe/Isle_of_Man', 'Europe/Istanbul', 'Europe/Jersey', 'Europe/Kaliningrad', 'Europe/Kiev', 'Europe/Kirov', 'Europe/Lisbon', 'Europe/Ljubljana', 'Europe/London', 'Europe/Luxembourg', 'Europe/Madrid', 'Europe/Malta', 'Europe/Mariehamn', 'Europe/Minsk', 'Europe/Monaco', 'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Podgorica', 'Europe/Prague', 'Europe/Riga', 'Europe/Rome', 'Europe/Samara', 'Europe/San_Marino', 'Europe/Sarajevo', 'Europe/Saratov', 'Europe/Simferopol', 'Europe/Skopje', 'Europe/Sofia', 'Europe/Stockholm', 'Europe/Tallinn', 'Europe/Tirane', 'Europe/Ulyanovsk', 'Europe/Vaduz', 'Europe/Vatican', 'Europe/Vienna', 'Europe/Vilnius', 'Europe/Volgograd', 'Europe/Warsaw', 'Europe/Zagreb', 'Europe/Zurich', 'Indian/Antananarivo', 'Indian/Chagos', 'Indian/Christmas', 'Indian/Cocos', 'Indian/Comoro', 'Indian/Kerguelen', 'Indian/Mahe', 'Indian/Maldives', 'Indian/Mauritius', 'Indian/Mayotte', 'Indian/Reunion', 'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville', 'Pacific/Chatham', 'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury', 'Pacific/Fakaofo', 'Pacific/Fiji', 'Pacific/Funafuti', 'Pacific/Galapagos', 'Pacific/Gambier', 'Pacific/Guadalcanal', 'Pacific/Guam', 'Pacific/Honolulu', 'Pacific/Kiritimati', 'Pacific/Kosrae', 'Pacific/Kwajalein', 'Pacific/Majuro', 'Pacific/Marquesas', 'Pacific/Midway', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Norfolk', 'Pacific/Noumea', 'Pacific/Pago_Pago', 'Pacific/Palau', 'Pacific/Pitcairn', 'Pacific/Ponape', 'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Saipan', 'Pacific/Tahiti', 'Pacific/Tarawa', 'Pacific/Tongatapu', 'Pacific/Truk', 'Pacific/Wake', 'Pacific/Wallis');
  CREATE TYPE "public"."enum_coaching_sessions_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no-show', 'rescheduled');
  CREATE TYPE "public"."enum_coaching_sessions_session_type" AS ENUM('video', 'phone', 'in-person');
  CREATE TYPE "public"."enum_home_page_features_icon" AS ENUM('BookOpen', 'Users', 'Sparkles', 'GraduationCap');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'subscriber' NOT NULL,
  	"is_active" boolean DEFAULT true,
  	"is_first_login" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"is_subscriber_only" boolean DEFAULT false,
  	"category" "enum_media_category" DEFAULT 'images' NOT NULL,
  	"created_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_tablet_url" varchar,
  	"sizes_tablet_width" numeric,
  	"sizes_tablet_height" numeric,
  	"sizes_tablet_mime_type" varchar,
  	"sizes_tablet_filesize" numeric,
  	"sizes_tablet_filename" varchar
  );
  
  CREATE TABLE "coach_profiles_expertise" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"area" varchar NOT NULL
  );
  
  CREATE TABLE "coach_profiles_availability" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_coach_profiles_availability_day" NOT NULL,
  	"start_time" varchar NOT NULL,
  	"end_time" varchar NOT NULL
  );
  
  CREATE TABLE "coach_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"display_name" varchar NOT NULL,
  	"slug" varchar,
  	"bio" varchar,
  	"profile_photo_id" integer,
  	"experience_years_of_experience" numeric,
  	"experience_credentials" varchar,
  	"experience_previous_work" varchar,
  	"is_active" boolean DEFAULT true,
  	"social_links_website" varchar,
  	"social_links_linkedin" varchar,
  	"social_links_twitter" varchar,
  	"timezone" "enum_coach_profiles_timezone" DEFAULT 'UTC' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "subscriber_profiles_interests" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic" varchar NOT NULL
  );
  
  CREATE TABLE "subscriber_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"display_name" varchar NOT NULL,
  	"avatar_id" integer,
  	"is_anonymous" boolean DEFAULT false,
  	"metadata_timezone" "enum_subscriber_profiles_metadata_timezone" DEFAULT 'UTC',
  	"metadata_language" varchar DEFAULT 'en',
  	"metadata_joined_at" timestamp(3) with time zone,
  	"learning_preferences_preferred_format" "enum_subscriber_profiles_learning_preferences_preferred_format",
  	"learning_preferences_pace" "enum_subscriber_profiles_learning_preferences_pace",
  	"is_active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"description" varchar,
  	"is_published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"is_published" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"author_id" integer NOT NULL,
  	"featured_image_id" integer,
  	"excerpt" varchar,
  	"content" jsonb NOT NULL,
  	"category_id" integer,
  	"is_subscriber_only" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"is_published" boolean DEFAULT false,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"content" jsonb NOT NULL,
  	"is_published" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"coach_profiles_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "courses_topics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic" varchar NOT NULL
  );
  
  CREATE TABLE "courses_learning_outcomes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"outcome" varchar NOT NULL
  );
  
  CREATE TABLE "courses_prerequisites" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"prerequisite" varchar NOT NULL
  );
  
  CREATE TABLE "courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"description" jsonb,
  	"short_description" varchar,
  	"instructor_id" integer NOT NULL,
  	"thumbnail_id" integer,
  	"cover_image_id" integer,
  	"preview_video" varchar,
  	"difficulty" "enum_courses_difficulty" DEFAULT 'beginner',
  	"duration_hours" numeric DEFAULT 0,
  	"duration_minutes" numeric DEFAULT 0,
  	"enrollment_is_open" boolean DEFAULT true,
  	"enrollment_max_enrollments" numeric,
  	"enrollment_start_date" timestamp(3) with time zone,
  	"enrollment_end_date" timestamp(3) with time zone,
  	"is_published" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"category_id" integer,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "courses_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"coach_profiles_id" integer,
  	"modules_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "modules_objectives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"objective" varchar NOT NULL
  );
  
  CREATE TABLE "modules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"description" varchar,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"completion_requirements_require_all_lessons" boolean DEFAULT true,
  	"completion_requirements_minimum_lessons" numeric,
  	"completion_requirements_require_quiz_pass" boolean DEFAULT false,
  	"estimated_duration_hours" numeric DEFAULT 0,
  	"estimated_duration_minutes" numeric DEFAULT 0,
  	"quiz_id" integer,
  	"is_published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "modules_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"lessons_id" integer
  );
  
  CREATE TABLE "lessons_resources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"file_id" integer NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "lessons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"description" varchar,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"type" "enum_lessons_type" DEFAULT 'video' NOT NULL,
  	"video_content_video_url" varchar,
  	"video_content_video_file_id" integer,
  	"video_content_transcript" jsonb,
  	"video_content_captions_id" integer,
  	"text_content" jsonb,
  	"audio_content_audio_file_id" integer,
  	"audio_content_transcript" jsonb,
  	"assignment_content_instructions" jsonb,
  	"assignment_content_due_in_days" numeric,
  	"assignment_content_submission_type" "enum_lessons_assignment_content_submission_type",
  	"assignment_content_max_points" numeric,
  	"quiz_id" integer,
  	"live_session_scheduled_at" timestamp(3) with time zone,
  	"live_session_meeting_url" varchar,
  	"live_session_recording_url" varchar,
  	"duration_hours" numeric DEFAULT 0,
  	"duration_minutes" numeric DEFAULT 0,
  	"is_free" boolean DEFAULT false,
  	"completion_criteria" "enum_lessons_completion_criteria" DEFAULT 'view',
  	"is_published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quizzes_questions_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"is_correct" boolean DEFAULT false,
  	"feedback" varchar
  );
  
  CREATE TABLE "quizzes_questions_accepted_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"answer" varchar
  );
  
  CREATE TABLE "quizzes_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question_type" "enum_quizzes_questions_question_type" DEFAULT 'multiple-choice' NOT NULL,
  	"question" jsonb NOT NULL,
  	"points" numeric DEFAULT 1,
  	"correct_answer" boolean,
  	"essay_settings_min_words" numeric,
  	"essay_settings_max_words" numeric,
  	"essay_settings_rubric" varchar,
  	"explanation" jsonb
  );
  
  CREATE TABLE "quizzes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"settings_time_limit" numeric,
  	"settings_passing_score" numeric DEFAULT 70,
  	"settings_max_attempts" numeric DEFAULT 0,
  	"settings_shuffle_questions" boolean DEFAULT false,
  	"settings_show_correct_answers" "enum_quizzes_settings_show_correct_answers" DEFAULT 'after-submit',
  	"settings_allow_review" boolean DEFAULT true,
  	"is_published" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enrollments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"subscriber_id" integer NOT NULL,
  	"course_id" integer NOT NULL,
  	"status" "enum_enrollments_status" DEFAULT 'active' NOT NULL,
  	"enrolled_at" timestamp(3) with time zone NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone,
  	"progress_percent_complete" numeric DEFAULT 0,
  	"progress_lessons_completed" numeric DEFAULT 0,
  	"progress_total_lessons" numeric DEFAULT 0,
  	"progress_modules_completed" numeric DEFAULT 0,
  	"progress_total_modules" numeric DEFAULT 0,
  	"progress_last_accessed_at" timestamp(3) with time zone,
  	"progress_time_spent" numeric DEFAULT 0,
  	"certificate_issued" boolean DEFAULT false,
  	"certificate_issued_at" timestamp(3) with time zone,
  	"certificate_certificate_id" varchar,
  	"certificate_certificate_url" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "progress_bookmarks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"timestamp" numeric,
  	"note" varchar,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "progress" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enrollment_id" integer NOT NULL,
  	"lesson_id" integer NOT NULL,
  	"status" "enum_progress_status" DEFAULT 'not-started' NOT NULL,
  	"started_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"last_accessed_at" timestamp(3) with time zone,
  	"video_progress_watched_seconds" numeric DEFAULT 0,
  	"video_progress_total_seconds" numeric,
  	"video_progress_percent_watched" numeric DEFAULT 0,
  	"video_progress_last_position" numeric DEFAULT 0,
  	"time_spent" numeric DEFAULT 0,
  	"notes" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "quiz_attempts_answers_selected_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"option_index" numeric
  );
  
  CREATE TABLE "quiz_attempts_answers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question_index" numeric NOT NULL,
  	"question_type" varchar,
  	"text_answer" varchar,
  	"essay_answer" jsonb,
  	"is_correct" boolean,
  	"points_awarded" numeric,
  	"feedback" varchar
  );
  
  CREATE TABLE "quiz_attempts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enrollment_id" integer NOT NULL,
  	"quiz_id" integer NOT NULL,
  	"attempt_number" numeric NOT NULL,
  	"status" "enum_quiz_attempts_status" DEFAULT 'in-progress' NOT NULL,
  	"started_at" timestamp(3) with time zone NOT NULL,
  	"submitted_at" timestamp(3) with time zone,
  	"graded_at" timestamp(3) with time zone,
  	"time_spent" numeric,
  	"score_points_earned" numeric DEFAULT 0,
  	"score_points_possible" numeric,
  	"score_percentage" numeric,
  	"passed" boolean,
  	"instructor_feedback" jsonb,
  	"graded_by_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coaching_sessions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"session_title" varchar NOT NULL,
  	"coach_id" integer NOT NULL,
  	"booker_name" varchar NOT NULL,
  	"booker_email" varchar NOT NULL,
  	"booker_phone" varchar,
  	"booked_by_user_id" integer,
  	"scheduled_at" timestamp(3) with time zone NOT NULL,
  	"duration" numeric DEFAULT 30 NOT NULL,
  	"timezone" "enum_coaching_sessions_timezone" DEFAULT 'UTC',
  	"status" "enum_coaching_sessions_status" DEFAULT 'pending' NOT NULL,
  	"session_type" "enum_coaching_sessions_session_type" DEFAULT 'video',
  	"meeting_link" varchar,
  	"zoom_meeting_join_url" varchar,
  	"zoom_meeting_meeting_id" varchar,
  	"zoom_meeting_password" varchar,
  	"zoom_meeting_created_at" timestamp(3) with time zone,
  	"topic" varchar,
  	"booker_notes" varchar,
  	"coach_notes" varchar,
  	"booked_at" timestamp(3) with time zone,
  	"confirmed_at" timestamp(3) with time zone,
  	"cancelled_at" timestamp(3) with time zone,
  	"cancellation_reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"coach_profiles_id" integer,
  	"subscriber_profiles_id" integer,
  	"categories_id" integer,
  	"tags_id" integer,
  	"posts_id" integer,
  	"pages_id" integer,
  	"courses_id" integer,
  	"modules_id" integer,
  	"lessons_id" integer,
  	"quizzes_id" integer,
  	"enrollments_id" integer,
  	"progress_id" integer,
  	"quiz_attempts_id" integer,
  	"coaching_sessions_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_page_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_home_page_features_icon" NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"content" varchar NOT NULL,
  	"avatar" varchar NOT NULL
  );
  
  CREATE TABLE "home_page_cta_benefits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_badge" varchar NOT NULL,
  	"hero_title" varchar NOT NULL,
  	"hero_highlighted_text" varchar NOT NULL,
  	"hero_description" varchar NOT NULL,
  	"hero_primary_button_text" varchar NOT NULL,
  	"hero_primary_button_link" varchar NOT NULL,
  	"hero_secondary_button_text" varchar NOT NULL,
  	"hero_secondary_button_link" varchar NOT NULL,
  	"features_header_badge" varchar NOT NULL,
  	"features_header_title" varchar NOT NULL,
  	"features_header_description" varchar NOT NULL,
  	"testimonials_header_badge" varchar NOT NULL,
  	"testimonials_header_title" varchar NOT NULL,
  	"cta_title" varchar NOT NULL,
  	"cta_description" varchar NOT NULL,
  	"cta_button_text" varchar NOT NULL,
  	"cta_button_link" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "blog_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_badge" varchar DEFAULT 'Blog' NOT NULL,
  	"hero_title" varchar DEFAULT 'Insights from Our Experts' NOT NULL,
  	"hero_description" varchar DEFAULT 'Discover articles, tutorials, and thoughts from our community of coaches and creators.' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "courses_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_badge" varchar DEFAULT 'Courses' NOT NULL,
  	"hero_title" varchar DEFAULT 'Learn New Skills' NOT NULL,
  	"hero_description" varchar DEFAULT 'Explore our catalog of expert-led courses designed to help you grow professionally and personally.' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "coaches_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_badge" varchar DEFAULT 'Our Coaches' NOT NULL,
  	"hero_title" varchar DEFAULT 'Learn from the Best' NOT NULL,
  	"hero_description" varchar DEFAULT 'Connect with experienced professionals ready to guide your journey to success.' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_nav_navigation_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "header_nav" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_content_product_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "footer_content_company_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "footer_content_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "footer_content" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"description" varchar NOT NULL,
  	"social_links_twitter" varchar,
  	"social_links_github" varchar,
  	"social_links_linkedin" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "meilisearch_admin" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"last_reindex" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coach_profiles_expertise" ADD CONSTRAINT "coach_profiles_expertise_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coach_profiles_availability" ADD CONSTRAINT "coach_profiles_availability_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_profile_photo_id_media_id_fk" FOREIGN KEY ("profile_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscriber_profiles_interests" ADD CONSTRAINT "subscriber_profiles_interests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subscriber_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscriber_profiles" ADD CONSTRAINT "subscriber_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscriber_profiles" ADD CONSTRAINT "subscriber_profiles_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_coach_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."coach_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_coach_profiles_fk" FOREIGN KEY ("coach_profiles_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_topics" ADD CONSTRAINT "courses_topics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_learning_outcomes" ADD CONSTRAINT "courses_learning_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_prerequisites" ADD CONSTRAINT "courses_prerequisites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_instructor_id_coach_profiles_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."coach_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_coach_profiles_fk" FOREIGN KEY ("coach_profiles_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_modules_fk" FOREIGN KEY ("modules_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modules_objectives" ADD CONSTRAINT "modules_objectives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modules" ADD CONSTRAINT "modules_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "modules_rels" ADD CONSTRAINT "modules_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "modules_rels" ADD CONSTRAINT "modules_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_resources" ADD CONSTRAINT "lessons_resources_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_resources" ADD CONSTRAINT "lessons_resources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_video_content_video_file_id_media_id_fk" FOREIGN KEY ("video_content_video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_video_content_captions_id_media_id_fk" FOREIGN KEY ("video_content_captions_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_audio_content_audio_file_id_media_id_fk" FOREIGN KEY ("audio_content_audio_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quizzes_questions_options" ADD CONSTRAINT "quizzes_questions_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes_questions_accepted_answers" ADD CONSTRAINT "quizzes_questions_accepted_answers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quizzes_questions" ADD CONSTRAINT "quizzes_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_subscriber_id_subscriber_profiles_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscriber_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "progress_bookmarks" ADD CONSTRAINT "progress_bookmarks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."progress"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "progress" ADD CONSTRAINT "progress_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "progress" ADD CONSTRAINT "progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quiz_attempts_answers_selected_options" ADD CONSTRAINT "quiz_attempts_answers_selected_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quiz_attempts_answers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quiz_attempts_answers" ADD CONSTRAINT "quiz_attempts_answers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_graded_by_id_coach_profiles_id_fk" FOREIGN KEY ("graded_by_id") REFERENCES "public"."coach_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_booked_by_user_id_users_id_fk" FOREIGN KEY ("booked_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coach_profiles_fk" FOREIGN KEY ("coach_profiles_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscriber_profiles_fk" FOREIGN KEY ("subscriber_profiles_id") REFERENCES "public"."subscriber_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_modules_fk" FOREIGN KEY ("modules_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quizzes_fk" FOREIGN KEY ("quizzes_id") REFERENCES "public"."quizzes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enrollments_fk" FOREIGN KEY ("enrollments_id") REFERENCES "public"."enrollments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_progress_fk" FOREIGN KEY ("progress_id") REFERENCES "public"."progress"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quiz_attempts_fk" FOREIGN KEY ("quiz_attempts_id") REFERENCES "public"."quiz_attempts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coaching_sessions_fk" FOREIGN KEY ("coaching_sessions_id") REFERENCES "public"."coaching_sessions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_stats" ADD CONSTRAINT "home_page_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_features" ADD CONSTRAINT "home_page_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_reviews" ADD CONSTRAINT "home_page_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_cta_benefits" ADD CONSTRAINT "home_page_cta_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_navigation_links" ADD CONSTRAINT "header_nav_navigation_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_content_product_links" ADD CONSTRAINT "footer_content_product_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_content_company_links" ADD CONSTRAINT "footer_content_company_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_content_legal_links" ADD CONSTRAINT "footer_content_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_content"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_created_by_idx" ON "media" USING btree ("created_by_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_tablet_sizes_tablet_filename_idx" ON "media" USING btree ("sizes_tablet_filename");
  CREATE INDEX "coach_profiles_expertise_order_idx" ON "coach_profiles_expertise" USING btree ("_order");
  CREATE INDEX "coach_profiles_expertise_parent_id_idx" ON "coach_profiles_expertise" USING btree ("_parent_id");
  CREATE INDEX "coach_profiles_availability_order_idx" ON "coach_profiles_availability" USING btree ("_order");
  CREATE INDEX "coach_profiles_availability_parent_id_idx" ON "coach_profiles_availability" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "coach_profiles_user_idx" ON "coach_profiles" USING btree ("user_id");
  CREATE UNIQUE INDEX "coach_profiles_slug_idx" ON "coach_profiles" USING btree ("slug");
  CREATE INDEX "coach_profiles_profile_photo_idx" ON "coach_profiles" USING btree ("profile_photo_id");
  CREATE INDEX "coach_profiles_updated_at_idx" ON "coach_profiles" USING btree ("updated_at");
  CREATE INDEX "coach_profiles_created_at_idx" ON "coach_profiles" USING btree ("created_at");
  CREATE INDEX "subscriber_profiles_interests_order_idx" ON "subscriber_profiles_interests" USING btree ("_order");
  CREATE INDEX "subscriber_profiles_interests_parent_id_idx" ON "subscriber_profiles_interests" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "subscriber_profiles_user_idx" ON "subscriber_profiles" USING btree ("user_id");
  CREATE INDEX "subscriber_profiles_avatar_idx" ON "subscriber_profiles" USING btree ("avatar_id");
  CREATE INDEX "subscriber_profiles_updated_at_idx" ON "subscriber_profiles" USING btree ("updated_at");
  CREATE INDEX "subscriber_profiles_created_at_idx" ON "subscriber_profiles" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");
  CREATE INDEX "posts_featured_image_idx" ON "posts" USING btree ("featured_image_id");
  CREATE INDEX "posts_category_idx" ON "posts" USING btree ("category_id");
  CREATE INDEX "posts_seo_seo_og_image_idx" ON "posts" USING btree ("seo_og_image_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_tags_id_idx" ON "posts_rels" USING btree ("tags_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_coach_profiles_id_idx" ON "pages_rels" USING btree ("coach_profiles_id");
  CREATE INDEX "pages_rels_users_id_idx" ON "pages_rels" USING btree ("users_id");
  CREATE INDEX "courses_topics_order_idx" ON "courses_topics" USING btree ("_order");
  CREATE INDEX "courses_topics_parent_id_idx" ON "courses_topics" USING btree ("_parent_id");
  CREATE INDEX "courses_learning_outcomes_order_idx" ON "courses_learning_outcomes" USING btree ("_order");
  CREATE INDEX "courses_learning_outcomes_parent_id_idx" ON "courses_learning_outcomes" USING btree ("_parent_id");
  CREATE INDEX "courses_prerequisites_order_idx" ON "courses_prerequisites" USING btree ("_order");
  CREATE INDEX "courses_prerequisites_parent_id_idx" ON "courses_prerequisites" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE INDEX "courses_instructor_idx" ON "courses" USING btree ("instructor_id");
  CREATE INDEX "courses_thumbnail_idx" ON "courses" USING btree ("thumbnail_id");
  CREATE INDEX "courses_cover_image_idx" ON "courses" USING btree ("cover_image_id");
  CREATE INDEX "courses_category_idx" ON "courses" USING btree ("category_id");
  CREATE INDEX "courses_seo_seo_og_image_idx" ON "courses" USING btree ("seo_og_image_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "courses_rels_order_idx" ON "courses_rels" USING btree ("order");
  CREATE INDEX "courses_rels_parent_idx" ON "courses_rels" USING btree ("parent_id");
  CREATE INDEX "courses_rels_path_idx" ON "courses_rels" USING btree ("path");
  CREATE INDEX "courses_rels_coach_profiles_id_idx" ON "courses_rels" USING btree ("coach_profiles_id");
  CREATE INDEX "courses_rels_modules_id_idx" ON "courses_rels" USING btree ("modules_id");
  CREATE INDEX "courses_rels_tags_id_idx" ON "courses_rels" USING btree ("tags_id");
  CREATE INDEX "modules_objectives_order_idx" ON "modules_objectives" USING btree ("_order");
  CREATE INDEX "modules_objectives_parent_id_idx" ON "modules_objectives" USING btree ("_parent_id");
  CREATE INDEX "modules_slug_idx" ON "modules" USING btree ("slug");
  CREATE INDEX "modules_quiz_idx" ON "modules" USING btree ("quiz_id");
  CREATE INDEX "modules_updated_at_idx" ON "modules" USING btree ("updated_at");
  CREATE INDEX "modules_created_at_idx" ON "modules" USING btree ("created_at");
  CREATE INDEX "modules_rels_order_idx" ON "modules_rels" USING btree ("order");
  CREATE INDEX "modules_rels_parent_idx" ON "modules_rels" USING btree ("parent_id");
  CREATE INDEX "modules_rels_path_idx" ON "modules_rels" USING btree ("path");
  CREATE INDEX "modules_rels_lessons_id_idx" ON "modules_rels" USING btree ("lessons_id");
  CREATE INDEX "lessons_resources_order_idx" ON "lessons_resources" USING btree ("_order");
  CREATE INDEX "lessons_resources_parent_id_idx" ON "lessons_resources" USING btree ("_parent_id");
  CREATE INDEX "lessons_resources_file_idx" ON "lessons_resources" USING btree ("file_id");
  CREATE INDEX "lessons_slug_idx" ON "lessons" USING btree ("slug");
  CREATE INDEX "lessons_video_content_video_content_video_file_idx" ON "lessons" USING btree ("video_content_video_file_id");
  CREATE INDEX "lessons_video_content_video_content_captions_idx" ON "lessons" USING btree ("video_content_captions_id");
  CREATE INDEX "lessons_audio_content_audio_content_audio_file_idx" ON "lessons" USING btree ("audio_content_audio_file_id");
  CREATE INDEX "lessons_quiz_idx" ON "lessons" USING btree ("quiz_id");
  CREATE INDEX "lessons_updated_at_idx" ON "lessons" USING btree ("updated_at");
  CREATE INDEX "lessons_created_at_idx" ON "lessons" USING btree ("created_at");
  CREATE INDEX "quizzes_questions_options_order_idx" ON "quizzes_questions_options" USING btree ("_order");
  CREATE INDEX "quizzes_questions_options_parent_id_idx" ON "quizzes_questions_options" USING btree ("_parent_id");
  CREATE INDEX "quizzes_questions_accepted_answers_order_idx" ON "quizzes_questions_accepted_answers" USING btree ("_order");
  CREATE INDEX "quizzes_questions_accepted_answers_parent_id_idx" ON "quizzes_questions_accepted_answers" USING btree ("_parent_id");
  CREATE INDEX "quizzes_questions_order_idx" ON "quizzes_questions" USING btree ("_order");
  CREATE INDEX "quizzes_questions_parent_id_idx" ON "quizzes_questions" USING btree ("_parent_id");
  CREATE INDEX "quizzes_updated_at_idx" ON "quizzes" USING btree ("updated_at");
  CREATE INDEX "quizzes_created_at_idx" ON "quizzes" USING btree ("created_at");
  CREATE INDEX "enrollments_subscriber_idx" ON "enrollments" USING btree ("subscriber_id");
  CREATE INDEX "enrollments_course_idx" ON "enrollments" USING btree ("course_id");
  CREATE INDEX "enrollments_updated_at_idx" ON "enrollments" USING btree ("updated_at");
  CREATE INDEX "enrollments_created_at_idx" ON "enrollments" USING btree ("created_at");
  CREATE INDEX "progress_bookmarks_order_idx" ON "progress_bookmarks" USING btree ("_order");
  CREATE INDEX "progress_bookmarks_parent_id_idx" ON "progress_bookmarks" USING btree ("_parent_id");
  CREATE INDEX "progress_enrollment_idx" ON "progress" USING btree ("enrollment_id");
  CREATE INDEX "progress_lesson_idx" ON "progress" USING btree ("lesson_id");
  CREATE INDEX "progress_updated_at_idx" ON "progress" USING btree ("updated_at");
  CREATE INDEX "progress_created_at_idx" ON "progress" USING btree ("created_at");
  CREATE INDEX "quiz_attempts_answers_selected_options_order_idx" ON "quiz_attempts_answers_selected_options" USING btree ("_order");
  CREATE INDEX "quiz_attempts_answers_selected_options_parent_id_idx" ON "quiz_attempts_answers_selected_options" USING btree ("_parent_id");
  CREATE INDEX "quiz_attempts_answers_order_idx" ON "quiz_attempts_answers" USING btree ("_order");
  CREATE INDEX "quiz_attempts_answers_parent_id_idx" ON "quiz_attempts_answers" USING btree ("_parent_id");
  CREATE INDEX "quiz_attempts_enrollment_idx" ON "quiz_attempts" USING btree ("enrollment_id");
  CREATE INDEX "quiz_attempts_quiz_idx" ON "quiz_attempts" USING btree ("quiz_id");
  CREATE INDEX "quiz_attempts_graded_by_idx" ON "quiz_attempts" USING btree ("graded_by_id");
  CREATE INDEX "quiz_attempts_updated_at_idx" ON "quiz_attempts" USING btree ("updated_at");
  CREATE INDEX "quiz_attempts_created_at_idx" ON "quiz_attempts" USING btree ("created_at");
  CREATE INDEX "coaching_sessions_coach_idx" ON "coaching_sessions" USING btree ("coach_id");
  CREATE INDEX "coaching_sessions_booked_by_user_idx" ON "coaching_sessions" USING btree ("booked_by_user_id");
  CREATE INDEX "coaching_sessions_updated_at_idx" ON "coaching_sessions" USING btree ("updated_at");
  CREATE INDEX "coaching_sessions_created_at_idx" ON "coaching_sessions" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_coach_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("coach_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_subscriber_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("subscriber_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_modules_id_idx" ON "payload_locked_documents_rels" USING btree ("modules_id");
  CREATE INDEX "payload_locked_documents_rels_lessons_id_idx" ON "payload_locked_documents_rels" USING btree ("lessons_id");
  CREATE INDEX "payload_locked_documents_rels_quizzes_id_idx" ON "payload_locked_documents_rels" USING btree ("quizzes_id");
  CREATE INDEX "payload_locked_documents_rels_enrollments_id_idx" ON "payload_locked_documents_rels" USING btree ("enrollments_id");
  CREATE INDEX "payload_locked_documents_rels_progress_id_idx" ON "payload_locked_documents_rels" USING btree ("progress_id");
  CREATE INDEX "payload_locked_documents_rels_quiz_attempts_id_idx" ON "payload_locked_documents_rels" USING btree ("quiz_attempts_id");
  CREATE INDEX "payload_locked_documents_rels_coaching_sessions_id_idx" ON "payload_locked_documents_rels" USING btree ("coaching_sessions_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "home_page_stats_order_idx" ON "home_page_stats" USING btree ("_order");
  CREATE INDEX "home_page_stats_parent_id_idx" ON "home_page_stats" USING btree ("_parent_id");
  CREATE INDEX "home_page_features_order_idx" ON "home_page_features" USING btree ("_order");
  CREATE INDEX "home_page_features_parent_id_idx" ON "home_page_features" USING btree ("_parent_id");
  CREATE INDEX "home_page_reviews_order_idx" ON "home_page_reviews" USING btree ("_order");
  CREATE INDEX "home_page_reviews_parent_id_idx" ON "home_page_reviews" USING btree ("_parent_id");
  CREATE INDEX "home_page_cta_benefits_order_idx" ON "home_page_cta_benefits" USING btree ("_order");
  CREATE INDEX "home_page_cta_benefits_parent_id_idx" ON "home_page_cta_benefits" USING btree ("_parent_id");
  CREATE INDEX "header_nav_navigation_links_order_idx" ON "header_nav_navigation_links" USING btree ("_order");
  CREATE INDEX "header_nav_navigation_links_parent_id_idx" ON "header_nav_navigation_links" USING btree ("_parent_id");
  CREATE INDEX "footer_content_product_links_order_idx" ON "footer_content_product_links" USING btree ("_order");
  CREATE INDEX "footer_content_product_links_parent_id_idx" ON "footer_content_product_links" USING btree ("_parent_id");
  CREATE INDEX "footer_content_company_links_order_idx" ON "footer_content_company_links" USING btree ("_order");
  CREATE INDEX "footer_content_company_links_parent_id_idx" ON "footer_content_company_links" USING btree ("_parent_id");
  CREATE INDEX "footer_content_legal_links_order_idx" ON "footer_content_legal_links" USING btree ("_order");
  CREATE INDEX "footer_content_legal_links_parent_id_idx" ON "footer_content_legal_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "coach_profiles_expertise" CASCADE;
  DROP TABLE "coach_profiles_availability" CASCADE;
  DROP TABLE "coach_profiles" CASCADE;
  DROP TABLE "subscriber_profiles_interests" CASCADE;
  DROP TABLE "subscriber_profiles" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "courses_topics" CASCADE;
  DROP TABLE "courses_learning_outcomes" CASCADE;
  DROP TABLE "courses_prerequisites" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "courses_rels" CASCADE;
  DROP TABLE "modules_objectives" CASCADE;
  DROP TABLE "modules" CASCADE;
  DROP TABLE "modules_rels" CASCADE;
  DROP TABLE "lessons_resources" CASCADE;
  DROP TABLE "lessons" CASCADE;
  DROP TABLE "quizzes_questions_options" CASCADE;
  DROP TABLE "quizzes_questions_accepted_answers" CASCADE;
  DROP TABLE "quizzes_questions" CASCADE;
  DROP TABLE "quizzes" CASCADE;
  DROP TABLE "enrollments" CASCADE;
  DROP TABLE "progress_bookmarks" CASCADE;
  DROP TABLE "progress" CASCADE;
  DROP TABLE "quiz_attempts_answers_selected_options" CASCADE;
  DROP TABLE "quiz_attempts_answers" CASCADE;
  DROP TABLE "quiz_attempts" CASCADE;
  DROP TABLE "coaching_sessions" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "home_page_stats" CASCADE;
  DROP TABLE "home_page_features" CASCADE;
  DROP TABLE "home_page_reviews" CASCADE;
  DROP TABLE "home_page_cta_benefits" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "blog_page" CASCADE;
  DROP TABLE "courses_page" CASCADE;
  DROP TABLE "coaches_page" CASCADE;
  DROP TABLE "header_nav_navigation_links" CASCADE;
  DROP TABLE "header_nav" CASCADE;
  DROP TABLE "footer_content_product_links" CASCADE;
  DROP TABLE "footer_content_company_links" CASCADE;
  DROP TABLE "footer_content_legal_links" CASCADE;
  DROP TABLE "footer_content" CASCADE;
  DROP TABLE "meilisearch_admin" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_media_category";
  DROP TYPE "public"."enum_coach_profiles_availability_day";
  DROP TYPE "public"."enum_coach_profiles_timezone";
  DROP TYPE "public"."enum_subscriber_profiles_metadata_timezone";
  DROP TYPE "public"."enum_subscriber_profiles_learning_preferences_preferred_format";
  DROP TYPE "public"."enum_subscriber_profiles_learning_preferences_pace";
  DROP TYPE "public"."enum_courses_difficulty";
  DROP TYPE "public"."enum_lessons_type";
  DROP TYPE "public"."enum_lessons_assignment_content_submission_type";
  DROP TYPE "public"."enum_lessons_completion_criteria";
  DROP TYPE "public"."enum_quizzes_questions_question_type";
  DROP TYPE "public"."enum_quizzes_settings_show_correct_answers";
  DROP TYPE "public"."enum_enrollments_status";
  DROP TYPE "public"."enum_progress_status";
  DROP TYPE "public"."enum_quiz_attempts_status";
  DROP TYPE "public"."enum_coaching_sessions_timezone";
  DROP TYPE "public"."enum_coaching_sessions_status";
  DROP TYPE "public"."enum_coaching_sessions_session_type";
  DROP TYPE "public"."enum_home_page_features_icon";`)
}
