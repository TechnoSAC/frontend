/**
 * Application service store for the `Fulfillment` bounded context.
 * Manages vehicles and drivers for fuel delivery fleet.
 *
 * @module useFulfillmentStore
 */
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { FulfillmentApi } from "../infrastructure/fulfillment-api.js";
import { VehicleAssembler } from "../infrastructure/vehicle.assembler.js";
import { DriverAssembler } from "../infrastructure/driver.assembler.js";
import { Vehicle } from "../domain/model/vehicle.entity.js";
import { Driver } from "../domain/model/driver.entity.js";

const fulfillmentApi = new FulfillmentApi();

const useFulfillmentStore = defineStore('fulfillment', () => {
    /** @type {import('vue').Ref<Vehicle[]>} */
    const vehicles = ref([]);
    /** @type {import('vue').Ref<Driver[]>} */
    const drivers = ref([]);
    /** @type {import('vue').Ref<Error[]>} */
    const errors = ref([]);
    /** @type {import('vue').Ref<boolean>} */
    const vehiclesLoaded = ref(false);
    /** @type {import('vue').Ref<boolean>} */
    const driversLoaded = ref(false);
    /** @type {import('vue').Ref<boolean>} */
    const loading = ref(false);

    /** @type {import('vue').ComputedRef<number>} */
    const vehiclesCount = computed(() => vehiclesLoaded.value ? vehicles.value.length : 0);
    /** @type {import('vue').ComputedRef<number>} */
    const driversCount = computed(() => driversLoaded.value ? drivers.value.length : 0);

    // VEHICLES
    function fetchVehicles() {
        loading.value = true;
        fulfillmentApi.getVehicles().then(response => {
            vehicles.value = VehicleAssembler.toEntitiesFromResponse(response);
            vehiclesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => {
            loading.value = false;
        });
    }

    function getVehicleById(id) {
        const idNum = parseInt(id);
        return vehicles.value.find(v => v.id === idNum || v.id === id);
    }

    function addVehicle(vehicle) {
        fulfillmentApi.createVehicle(vehicle).then(response => {
            const newVehicle = VehicleAssembler.toEntityFromResource(response.data);
            vehicles.value.push(newVehicle);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function updateVehicle(vehicle) {
        fulfillmentApi.updateVehicle(vehicle).then(response => {
            const updated = VehicleAssembler.toEntityFromResource(response.data);
            const index = vehicles.value.findIndex(v => v.id === updated.id);
            if (index !== -1) vehicles.value[index] = updated;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function deleteVehicle(vehicle) {
        fulfillmentApi.deleteVehicle(vehicle.id).then(() => {
            const index = vehicles.value.findIndex(v => v.id === vehicle.id);
            if (index !== -1) vehicles.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    // DRIVERS
    function fetchDrivers() {
        loading.value = true;
        fulfillmentApi.getDrivers().then(response => {
            drivers.value = DriverAssembler.toEntitiesFromResponse(response);
            driversLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        }).finally(() => {
            loading.value = false;
        });
    }

    function getDriverById(id) {
        const idNum = parseInt(id);
        return drivers.value.find(d => d.id === idNum || d.id === id);
    }

    function addDriver(driver) {
        fulfillmentApi.createDriver(driver).then(response => {
            const newDriver = DriverAssembler.toEntityFromResource(response.data);
            drivers.value.push(newDriver);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function updateDriver(driver) {
        fulfillmentApi.updateDriver(driver).then(response => {
            const updated = DriverAssembler.toEntityFromResource(response.data);
            const index = drivers.value.findIndex(d => d.id === updated.id);
            if (index !== -1) drivers.value[index] = updated;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function deleteDriver(driver) {
        fulfillmentApi.deleteDriver(driver.id).then(() => {
            const index = drivers.value.findIndex(d => d.id === driver.id);
            if (index !== -1) drivers.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function clearErrors() {
        errors.value = [];
    }

    return {
        vehicles,
        drivers,
        errors,
        vehiclesLoaded,
        driversLoaded,
        loading,
        vehiclesCount,
        driversCount,
        fetchVehicles,
        getVehicleById,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        fetchDrivers,
        getDriverById,
        addDriver,
        updateDriver,
        deleteDriver,
        clearErrors
    };
});

export default useFulfillmentStore;