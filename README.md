# Water meter reader

This application runs on a C.H.I.P. (a Raspberry Pi-like computer) and will
monitor for water meter pulses and send them to a Google Sheet.

## How to develop

We develop the C.H.I.P. by syncing the code over to the C.H.I.P. and running
everything there.

### Set up syncing

1. Make sure that you and the C.H.I.P. computer are on the same network
2. Figure out the IP address of the C.H.I.P. computer. This is often something
   like 192.168.0.123
3. SSH into the C.H.I.P. using:
   ```shell
   ssh root@192.168.0.123
   # The default password is "chip", but for devices that we've provisioned,
   # we've changed them to "I monitor the water"
   ```
4. Install your own certificate in authorized_keys
   ```shell
   # On your local machine
   cat ~/.ssh/id_*.pub
   # Copy and paste that onto the C.H.I.P.
   # On the C.H.I.P.
   mkdir -p ~/.ssh
   echo 'PASTE YOUR AUTHORIZED_KEYS HERE' >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```
5. Verify that `ssh root@192.168.0.123` no longer requires a password

### Sync the code

On your local machine, run:

```shell
SYNC_SERVER=192.168.0.123 gulp sync
```

This should start syncing all of your code over to the C.H.I.P.

SSH into the C.H.I.P. (e.g., `ssh root@192.168.0.123`) and run any commands
you might need to test and install all the software.

```shell
ssh root@192.168.0.123
# On the C.H.I.P.
cd water-meter
bash sysadmin/install-prerequisites.sh
yarn install
yarn jest someTest.test
```

## How it works

In short, this software powers a C.H.I.P., which

1. Counts the number of pulses it receives from a few water meters
2. Saves the result locally, and
3. Once an hour, uploads it to a Google Sheet.

### C.H.I.P.

This device is meant to be run on a C.H.I.P., a discontinued, Raspberry Pi-like
computer that runs on a Micro-USB power supply.

We chose the C.H.I.P. because:

- It's cheap ($9)
- It has a built-in Wi-Fi adapter (the Raspberry Pi 2 didn't have one), and
- Has the GPIO pins/ports needed

However, it's been discontinued, so the most recent Raspberry Pis would work
just fine. You just need to substitute out `chip-io` for `raspi-io` and re-map
the GPIO ports.

### Wiring and water meters

The C.H.I.P. connects to water meters through regular old wires. This should be
compatible with any water meter, but in our case, we used the following:

[DAE VM-100P 1” Positive Displacement Water Meter with Pulse Output, Measuring in Gallon + Couplings](https://daecontrol.com/product/dae-vm-100p-1-positive-displacement-water-meter-with-pulse-output-measuring-in-gallon-couplings/)

See the circuit diagram for how it's wired up:

https://docs.google.com/drawings/d/1mreJUlSr_8Lj_v_qnm54Mb6FJzXbTNlOOgfM4Ys-_sU/edit
