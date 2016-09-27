Trumpet
=======
1. for the lulz
2. ???
3. lol

Running the server
------------------

### Locally

1. Install Rust >= 1.1.0
2. `cargo run`

### On the Remote Server

1. Install and configure nginx as a reverse HTTP proxy.
2. SCP Rust server app binaries and start on required ports, ie.
   `trumpet -p PORT`.

Misc Notes on Speech
--------------------

### Phonemes

- [CMU Dictionary](http://svn.code.sf.net/p/cmusphinx/code/trunk/cmudict/),
  which uses [Arpabet](https://en.wikipedia.org/wiki/Arpabet).
  - 54 units in the Arpabet:
    - Vowels:
      - 10 monophthongs (AO, AA, IY, UW, EH, IH, UH, AH, AX, AE)
      - 5 diphthongs (EY, AY, OW, AW, OY)
      - 8 R-colored vowels (ER, AXR, EH R, UH R, AO R, AA R, IH|IY R, AW R)
    - Consonants:
      - 6 Stops (P, B, T, D, K, G)
      - 2 Affricates (CH, JH)
      - 9 Fricatives (F, V, TH, DH, S, Z, SH, ZH, HH)
      - 6 Nasals (M, EM, N, EN, NG, ENG)
      - 5 Liquids (L, EL, R, DX, MX)
      - 3 Semivowels (Y, W, Q)

### Diphones

TODO: Generate a list of phoneme 2-tuples.

### Unit Selection

- Combine multiple sources into final output (words, phonemes, diphones)
- Have alternatives (words, phonemes) that pair better with others.
- Optimize joining on a score (start/ending pitch, tempo, etc.)

Production Server
-----------------
The production server is `209.239.112.74`.

I'm using nginx as a reverse HTTP proxy.

To manage the process, `sudo service nginx restart`, etc.

To see what processes bind a port, `sudo lsof -i:80`, etc.

### Current nginx config

In sites-available, at `/etc/nginx/sites-enabled/default`,

```
server {
  # XXX: Note - port 9000 is a temporary artifact; normally port 80.
  listen 9000;
  server_name jungle.horse;
  location / {
    proxy_pass http://127.0.0.1:8888;
  }
}

server {
  listen 9000;
  server_name capitalism.store;
  location / {
    proxy_pass http://127.0.0.1:9999;
  }
}
```

### Old IPTABLES Config

This was the old iptables-based routing. Even after flushing the rules,
port 80 still forwards to 9000 for some reason.

The rules were (prior to flush),

```
bt@colossus960:~$ sudo iptables --list-rules
-P INPUT ACCEPT
-P FORWARD ACCEPT
-P OUTPUT ACCEPT
-A INPUT -i eth0 -p tcp -m tcp --dport 80 -j ACCEPT
-A INPUT -i eth0 -p tcp -m tcp --dport 9000 -j ACCEPT
```

And,

```
bt@colossus960:~$ sudo iptables -L
Chain INPUT (policy ACCEPT)
target     prot opt source               destination
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:http
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:9000

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
```

### User Creation

1. sudo useradd $NAME
2. sudo mkdir /home/$NAME
3. (copy .bashrc, .profile, .bash\_logout to homedir)
4. (chown homedir to new user)
5. sudo chsh -s /bin/bash $NAME
6. sudo passwd $NAME

