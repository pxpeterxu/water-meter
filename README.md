# Water meter reader

This application runs on a single-board computer (SBC; e.g., Raspberry Pi or
C.H.I.P.) and will monitor for water meter pulses and send them to a Google Sheet.

## How to develop

We develop the SBC by syncing the code over to the computer and running
everything there.

### Set up syncing

1. Make sure that you and the SBC computer are on the same network
2. Figure out the IP address of the SBC computer. This is often something
   like 192.168.0.123
3. SSH into the SBC computer using:
   ```shell
   ssh root@192.168.0.123
   ```
4. Install your own certificate in authorized_keys
   ```shell
   # On your local machine
   cat ~/.ssh/id_*.pub
   # Copy and paste that onto the SBC computer
   # On the embedded
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

This should start syncing all of your code over to the SBC computer

SSH into the SBC computer (e.g., `ssh root@192.168.0.123`) and run any commands
you might need to test and install all the software.

```shell
ssh root@192.168.0.123
# On the SBC computer
cd water-meter
bash sysadmin/install-prerequisites.sh
yarn install
yarn jest someTest.test
```

## How it works

In short, this software powers a SBC computer, which

1. Counts the number of pulses it receives from a few water meters
2. Saves the result locally, and
3. Once an hour, uploads it to a Google Sheet.

### SBC computer

This device is meant to be run on either a C.H.I.P. computer, a discontinued,
Raspberry Pi-like computer, or a Raspberry Pi itself.

The Raspberry Pi will be supported long-term as it has an established ecosystem.
C.H.I.P. was used for the initial version of this, and code is kept for
posterity.

### Wiring and water meters

The SBC computer connects to water meters through regular wires. This should be
compatible with any water meter that emits pulses, but in our case, we used the
following:

[DAE VM-100P 1” Positive Displacement Water Meter with Pulse Output, Measuring in Gallon + Couplings](https://daecontrol.com/product/dae-vm-100p-1-positive-displacement-water-meter-with-pulse-output-measuring-in-gallon-couplings/)

See the circuit diagram for how it's wired up:

https://docs.google.com/drawings/d/1mreJUlSr_8Lj_v_qnm54Mb6FJzXbTNlOOgfM4Ys-_sU/edit
