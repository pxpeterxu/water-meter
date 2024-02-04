# Water meter reader

This application runs on a single-board computer (SBC; just Raspberry Pi for
now) and will monitor for water meter pulses and send them to a Google Sheet.

## How to set up on Raspberry Pi

The steps are roughly:

1. Initialize your Raspberry Pi so you can SSH into it at least
2. Create a Google Sheet and a Google Cloud service account that can access it
3. Install the software onto the board and configure it
4. (Optional) Set up alterative Wi-Fi networks
5. Connect wires to water meter based on circuit diagram

### 1. Initialize Raspberry Pi

Follow the instructions here so you can SSH into your Raspberry Pi without
connecting it to a computer or external keyboard (since you likely don't have
those things)

https://gallaugher.com/makersnack-setup-a-raspberry-pi-without-a-keyboard-or-mouse-headless-install/

### 2. Create a Google Sheet and Google Cloud service account

1. Make a copy of
   https://docs.google.com/spreadsheets/d/1KViVywHr-VgBb7X2jAeSxuk7AbjgH07P2RPE_2mUxPE/edit
2. Take note of the spreadsheet ID: e.g., the part in the URL after `/d/`
3. Create a service account in any Google Cloud project: e.g.,
   https://console.cloud.google.com/iam-admin/serviceaccounts
4. Create a key for that Service Account and download it in JSON format
5. Using SFTP, upload it to the Raspberry Pi
   ```shell
   # This host name should be replaced with the host name
   # you set in the "Initialize Raspberry Pi" step
   sftp root@raspberrypihost.local
   # Your key file will have a different name
   put hobby-projects-344701-4b30d6c4518e.json
   ```

### 3. Install software

SSH into the Raspberry Pi, get the code, run install scripts.

```shell
# This host name should be replaced with the host name
# you set in the "Initialize Raspberry Pi" step
ssh root@raspberrypihost.local

cd /root
git clone https://github.com/pxpeterxu/water-meter.git
cd water-meter

bash sysadmin/install.sh YOUR-UPLOADED-KEY.json GOOGLE-SHEETS-ID
# bash sysadmin/install.sh hobby-projects-344701-4b30d6c4518e.json 1KViVywHr-VgBb7X2jAeSxuk7AbjgH07P2RPE_2mUxPE
```

### 4. Connect to more Wi-Fi networks

Is your water meter somewhere where it would have to connect to a different
Wi-Fi network? If that's the case, edit wpa_supplicant.conf so that

```shell
# This host name should be replaced with the host name
# you set in the "Initialize Raspberry Pi" step
ssh root@raspberrypihost.local
vi /etc/wpa_supplicant/wpa_supplicant.conf

# Add lines similar to the below
# Linux will connect to Wi-Fi networks by trying the minimum
# priority first
network {
  ssid="yourNetwork"
  psk="yourPassword"
  priority=1
}

network {
  ssid="lowerPriorityNetwork"
  psk="anotherPassword"
  priority=2
}
```

### 5. Wiring and water meters

The SBC computer connects to water meters through regular wires. This should be
compatible with any water meter that emits pulses, but in our case, we used the
following:

[DAE VM-100P 1” Positive Displacement Water Meter with Pulse Output, Measuring in Gallon + Couplings](https://daecontrol.com/product/dae-vm-100p-1-positive-displacement-water-meter-with-pulse-output-measuring-in-gallon-couplings/)

See the circuit diagram for how it's wired up:

https://docs.google.com/drawings/d/1mreJUlSr_8Lj_v_qnm54Mb6FJzXbTNlOOgfM4Ys-_sU/edit

## How to develop

We develop the SBC by syncing the code over to the computer and running
everything there.

### Set up syncing

1. Make sure that you and the SBC are on the same network
2. Figure out the IP address of the SBC. This is often something
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

In short, this software powers a SBC, which

1. Counts the number of pulses it receives from a few water meters
2. Saves the result locally, and
3. Once an hour, uploads it to a Google Sheet.

### SBC computer

This device is meant to be run on a Single Board Computer (Raspberry Pi).

The Raspberry Pi will be supported long-term as it has an established ecosystem.
C.H.I.P. was used for the initial version of this, but is discontinued and not
supported so the code was remmoved.
