from pathlib import Path
names=['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
paths=[
'M50 88 Q36 66 38 48 Q15 47 20 29 Q25 13 39 24 Q50 34 50 59 Q50 34 61 24 Q75 13 80 29 Q85 47 62 48 Q64 66 50 88',
'M28 20 Q23 43 42 46 M72 20 Q77 43 58 46 M30 63 Q50 42 70 63 L63 82 L50 90 L37 82 Z M36 63 L42 66 M64 63 L58 66',
'M28 25 Q50 34 72 25 M28 80 Q50 71 72 80 M38 29 L38 76 M62 29 L62 76 M29 48 L18 56 M71 48 L82 56',
'M32 50 Q50 40 68 50 L73 64 L61 78 L39 78 L27 64 Z M30 55 L16 48 L12 34 L22 39 L29 31 L30 49 M70 55 L84 48 L88 34 L78 39 L71 31 L70 49 M32 69 L15 76 M68 69 L85 76',
'M65 72 Q90 59 73 35 Q66 10 43 20 Q15 25 21 55 Q24 77 43 75 L46 63 L40 55 L46 46 L62 47 L67 58 L58 70 L58 84 L78 84 M37 31 Q55 24 65 39',
'M38 82 L38 31 Q45 18 51 31 L51 65 Q62 80 75 63 M27 82 L27 39 Q25 25 35 30 M50 34 Q64 19 65 37 L65 57 M51 65 L69 87 M73 42 L83 25',
'M50 25 L50 80 M27 83 L73 83 M18 43 L82 43 M29 43 L18 68 L40 68 Z M71 43 L60 68 L82 68 Z M44 25 L56 25',
'M22 33 L22 67 Q24 82 35 70 L35 33 M35 43 Q48 23 48 40 L48 65 Q52 82 62 68 L62 33 M62 48 Q78 39 78 65 Q77 83 90 76 M90 76 L86 65 M90 76 L79 82',
'M22 80 L78 24 M54 24 L78 24 L78 48 M30 42 L60 72 M29 69 L41 81',
'M24 32 L35 69 Q38 79 44 65 L55 33 Q65 18 73 31 Q79 40 66 47 L54 53 Q45 79 63 84 Q82 86 85 68 Q87 51 71 57',
'M18 34 L32 26 L47 40 L61 26 L77 40 L88 33 M18 56 L32 48 L47 62 L61 48 L77 62 L88 55 M28 76 L22 86 M50 76 L44 86 M73 76 L67 86',
'M26 24 Q59 51 26 83 M74 24 Q41 51 74 83 M21 53 L79 53 M25 29 L38 28 M25 78 L38 79 M75 29 L62 28 M75 78 L62 79']
for i,(name,path) in enumerate(zip(names,paths)):
 stars=''.join(f'<circle cx="{x}" cy="{y}" r="1.5" fill="#d9ebff"/>' for x,y in [(12,18),(86,13),(91,90),(10,83)])
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 100 100"><defs><filter id="g"><feGaussianBlur stdDeviation="1.2"/></filter></defs><path d="{path}" fill="none" stroke="#aabaff" stroke-width="4" opacity=".35" filter="url(#g)"/><path d="{path}" fill="none" stroke="#dfd7b9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>{stars}</svg>'
 Path(f'dist/assets/{name.lower()}.svg').write_text(svg)
