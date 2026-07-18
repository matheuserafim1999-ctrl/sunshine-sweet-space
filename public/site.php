<?php
http_response_code(200);
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');
?><!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="index,follow">
<title>Consejos de ahorro y finanzas personales</title>
<meta name="description" content="Blog con consejos prácticos de ahorro, presupuesto familiar y educación financiera.">
<style>
  *{box-sizing:border-box}
  body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1a1a1a;background:#fff;line-height:1.6}
  header{background:#0b5cff;color:#fff;padding:24px 20px}
  header h1{margin:0;font-size:22px}
  nav{max-width:900px;margin:0 auto}
  main{max-width:900px;margin:0 auto;padding:28px 20px}
  h2{margin-top:32px;font-size:20px;color:#0b5cff}
  article{border-bottom:1px solid #eee;padding:16px 0}
  footer{max-width:900px;margin:24px auto;padding:20px;color:#666;font-size:13px;border-top:1px solid #eee}
  a{color:#0b5cff;text-decoration:none}
</style>
</head>
<body>
<header><nav><h1>Ahorro Inteligente</h1></nav></header>
<main>
  <p>Bienvenido a nuestro blog dedicado a la educación financiera. Aquí compartimos consejos prácticos para ahorrar, organizar el presupuesto familiar y tomar mejores decisiones con tu dinero.</p>

  <h2>Artículos recientes</h2>

  <article>
    <h3>5 hábitos simples para ahorrar cada mes</h3>
    <p>Descubre pequeños cambios en tu rutina que pueden generar grandes ahorros a fin de año, desde revisar suscripciones hasta planificar las compras del supermercado.</p>
  </article>

  <article>
    <h3>Cómo hacer un presupuesto familiar realista</h3>
    <p>Aprende a categorizar tus gastos, definir metas de ahorro y ajustar tu presupuesto sin dejar de disfrutar la vida cotidiana.</p>
  </article>

  <article>
    <h3>Educación financiera para toda la familia</h3>
    <p>Consejos para hablar con niños y adolescentes sobre el valor del dinero y enseñarles buenos hábitos desde temprano.</p>
  </article>

  <article>
    <h3>Fondo de emergencia: por qué y cómo empezar</h3>
    <p>Guía paso a paso para construir un colchón financiero que te dé tranquilidad ante imprevistos.</p>
  </article>
</main>
<footer>
  <p>&copy; <?php echo date('Y'); ?> Ahorro Inteligente — Contenido educativo. Este sitio no ofrece asesoría financiera profesional.</p>
  <p><a href="#">Sobre nosotros</a> · <a href="#">Contacto</a> · <a href="#">Política de privacidad</a></p>
</footer>
</body>
</html>
