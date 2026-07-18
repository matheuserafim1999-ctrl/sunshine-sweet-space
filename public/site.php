<?php
// Redirect HTTP 302 real (não é meta refresh) — garante que os assets do /front/ carreguem corretamente
header('Location: /front/', true, 302);
exit;
