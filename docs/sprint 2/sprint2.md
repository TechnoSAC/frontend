## User Stories Sprint 2

### User Story: US-47 — Ver Dashboard principal del proveedor

**Description:**  
Como proveedor, quiero acceder a un panel principal con KPIs de operación y un gráfico de tendencia de ventas para tener visibilidad en tiempo real del estado de mi negocio.

**Scenarios:**

**Escenario 1: Visualización de KPIs y gráfico de tendencia**  
Dado que el proveedor accede al dashboard principal,  
Cuando se cargan los datos del periodo activo,  
Entonces visualiza las tarjetas de KPIs y un gráfico de tendencia.

**Escenario 2: Navegación desde el dashboard hacia otras secciones**  
Dado que el proveedor revisa el panel principal,  
Cuando selecciona accesos directos,  
Entonces es redirigido a las vistas correspondientes.

---

### User Story: US-19 — Ver resumen de pedidos (Proveedor)

**Description:**  
Como proveedor, quiero ver un resumen de pedidos gestionados y pendientes para organizar a los clientes.

**Scenarios:**

**Escenario 1: Visualización de KPIs con datos**  
Dado que el proveedor tiene pedidos registrados,  
Cuando accede a su dashboard,  
Entonces ve KPIs de pedidos pendientes, aprobados, rechazados, despachados y finalizados.

**Escenario 2: Sin datos registrados**  
Dado que no hay pedidos registrados,  
Cuando se carga el dashboard,  
Entonces los KPIs se muestran con valor cero.

---

### User Story: US-10 — Ver pedidos pendientes

**Description:**  
Como proveedor, quiero ver todos los pedidos pendientes para analizarlos y tomar acción.

**Scenarios:**

**Escenario 1: Listado de pedidos pendientes**  
Dado que el proveedor accede al panel,  
Cuando visualiza los pedidos pendientes,  
Entonces puede revisar sus detalles básicos.

**Escenario 2: Filtrado de pedidos**  
Dado que existen múltiples pedidos,  
Cuando el proveedor aplica filtros,  
Entonces encuentra rápidamente los pedidos requeridos.

---

### User Story: US-11 — Aprobar pedido

**Description:**  
Como proveedor, quiero aprobar pedidos según los depósitos hechos a mis cuentas bancarias.

**Scenarios:**

**Escenario 1: Aprobación exitosa**  
Dado que el proveedor verifica depósitos válidos,  
Cuando aprueba el pedido,  
Entonces el estado cambia a “Aprobado”.

**Escenario 2: Pago incompleto**  
Dado que el pedido no tiene pagos suficientes,  
Cuando el proveedor intenta aprobarlo,  
Entonces el sistema muestra un mensaje de error.

---

### User Story: US-42 — Rechazar pedido

**Description:**  
Como proveedor, quiero rechazar un pedido cuando no pueda atenderlo para notificar al solicitante oportunamente.

**Scenarios:**

**Escenario 1: Rechazo exitoso**  
Dado que el proveedor selecciona un pedido pendiente,  
Cuando ingresa el motivo y confirma,  
Entonces el pedido cambia a estado “Rechazado”.

**Escenario 2: Rechazo inválido**  
Dado que el pedido ya fue procesado,  
Cuando el proveedor intenta rechazarlo,  
Entonces el sistema bloquea la acción.

---

### User Story: US-12 — Marcar pedido como despachado

**Description:**  
Como proveedor, quiero marcar cuándo un pedido sale a entrega para notificar al cliente.

**Scenarios:**

**Escenario 1: Despacho exitoso**  
Dado que el pedido fue aprobado,  
Cuando el proveedor lo marca como despachado,  
Entonces el estado cambia a “Despachado”.

**Escenario 2: Restricción de despacho**  
Dado que el pedido aún no fue aprobado,  
Cuando se intenta despachar,  
Entonces el sistema bloquea la acción.

---

### User Story: US-13 — Cerrar pedido

**Description:**  
Como proveedor, quiero cerrar el pedido cuando el cliente confirme la entrega para finalizar el proceso.

**Scenarios:**

**Escenario 1: Cierre correcto**  
Dado que el cliente confirmó la entrega,  
Cuando el proveedor cierra el pedido,  
Entonces el pedido queda finalizado.

**Escenario 2: Restricción de cierre**  
Dado que la entrega aún no fue confirmada,  
Cuando el proveedor intenta cerrar el pedido,  
Entonces el sistema impide la acción.

---

### User Story: US-46 — Gestionar inventario de combustibles

**Description:**  
Como proveedor, quiero registrar, editar y eliminar productos de combustible para mantener actualizado mi catálogo.

**Scenarios:**

**Escenario 1: Registro exitoso de producto**  
Dado que el proveedor completa el formulario,  
Cuando guarda el producto,  
Entonces aparece disponible en el inventario.

**Escenario 2: Edición o eliminación de producto**  
Dado que el proveedor selecciona un producto existente,  
Cuando edita o elimina el registro,  
Entonces los cambios se reflejan inmediatamente.

---

### User Story: US-44 — Gestionar vehículos de flota

**Description:**  
Como proveedor, quiero registrar y administrar los vehículos de mi flota para asignarlos a pedidos.

**Scenarios:**

**Escenario 1: Registro exitoso de vehículo**  
Dado que el proveedor completa los datos del vehículo,  
Cuando guarda el registro,  
Entonces el vehículo queda disponible.

**Escenario 2: Eliminación de vehículo**  
Dado que el proveedor elimina un vehículo,  
Cuando confirma la acción,  
Entonces deja de aparecer en la flota.

---

### User Story: US-45 — Gestionar conductores

**Description:**  
Como proveedor, quiero registrar y administrar conductores para asignarlos a despachos.

**Scenarios:**

**Escenario 1: Registro exitoso de conductor**  
Dado que el proveedor completa los datos requeridos,  
Cuando guarda el conductor,  
Entonces queda disponible para asignaciones.

**Escenario 2: Edición de conductor**  
Dado que el proveedor modifica la información,  
Cuando guarda los cambios,  
Entonces la información se actualiza correctamente.

---

### User Story: US-34 — Ver gráfico de ventas (Proveedor)

**Description:**  
Como proveedor, quiero ver un gráfico de ventas por mes para monitorear el rendimiento del negocio.

**Scenarios:**

**Escenario 1: Visualización de gráfico**  
Dado que existen ventas registradas,  
Cuando el proveedor accede al módulo reporting,  
Entonces visualiza un gráfico de ventas mensuales.

**Escenario 2: Sin datos disponibles**  
Dado que no existen ventas registradas,  
Cuando el proveedor accede al módulo,  
Entonces el sistema muestra un mensaje informativo.

---

### User Story: US-48 — Ver distribución de ventas por sector

**Description:**  
Como proveedor, quiero ver la distribución de mis ventas por sector industrial para identificar clientes relevantes.

**Scenarios:**

**Escenario 1: Distribución con datos**  
Dado que existen ventas en múltiples sectores,  
Cuando el proveedor accede al reporte,  
Entonces visualiza un gráfico de distribución por sector.

**Escenario 2: Sin información suficiente**  
Dado que no existen suficientes registros,  
Cuando se carga el módulo,  
Entonces el sistema muestra un mensaje informativo.

---

### User Story: US-31 — Ver listado de empresas

**Description:**  
Como proveedor, quiero ver una lista de empresas solicitantes para identificar clientes frecuentes.

**Scenarios:**

**Escenario 1: Visualización del listado**  
Dado que existen empresas registradas,  
Cuando el proveedor accede al módulo,  
Entonces visualiza nombre, pedidos activos e historial.

**Escenario 2: Sin empresas registradas**  
Dado que no existen empresas registradas,  
Cuando se carga la vista,  
Entonces el sistema muestra un mensaje informativo.