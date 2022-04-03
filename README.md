Trumpet
=======
1. for the lulz
2. ???
3. lol

Namecheap DNS Notes
-------------------

### `trumped.com` DNS

```
Type    Host    Value                                                         TTL
CNAME   @       `trumped.com.s3-website-us-east-1.amazonaws.com.`             5 MIN
CNAME   api     `junglehorseapi-env.us-west-2.elasticbeanstalk.com.`          5 MIN
CNAME   cdn     `trumped-frontend.s3.amazonaws.com.`                          5 MIN
CNAME   www     `trumped-frontend.s3.amazonaws.com.`                          5 MIN
URL     *       `http://trumped.com`                                          Unmasked
```

### `brandon.audio` DNS

```
Type    Host    Value                                                         TTL
CNAME   @       `brandon.audio.s3-website-us-east-1.amazonaws.com`            5 MIN
CNAME   api     `junglehorseapi-env.us-west-2.elasticbeanstalk.com.`          5 MIN
CNAME   cdn     `cdn.brandon.audio.s3.amazonaws.com.`                         5 MIN
CNAME   www     `cdn.brandon.audio.s3.amazonaws.com.`                         5 MIN
URL     *       `http://brandon.audio`                                        Unmasked
```

### Old `jungle.horse`

```
Type    Host    Value                                                         TTL
CNAME   @       `junglehorse-frontend.s3-website-us-east-1.amazonaws.com.`    5 MIN
CNAME   api     `junglehorseapi-env.us-west-2.elasticbeanstalk.com.`          20 MIN
CNAME   cdn     `dy6kf1ub3ccan.cloudfront.net.`                               20 MIN
URL     www     `http://jungle.horse`                                         301 Permanent
```

AWS Notes
---------

### S3 Bucket

- Bucket *must* be named per the domain, eg. `trumped.com` instead of `trumped-index`.
- Static website hosting: set index.html, error.html
- Set the Bucket Policy: ```{
    "Version": "2012-10-17",
    "Id": "Policy1535378813796",
    "Statement": [
        {
            "Sid": "Stmt1478413958263",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::961528074194:user/junglehorse"
            },
            "Action": "s3:*",
            "Resource": "arn:aws:s3:::trumped.com/*"
        },
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::trumped.com/*"
        }
    ]
}
```

- Set CORS headers,

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>HEAD</AllowedMethod>
    <MaxAgeSeconds>3000</MaxAgeSeconds>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```

- Note that the URL is `http://trumped.com.s3-website-us-east-1.amazonaws.com/` (static websites), 
  not `http://trumped.com.s3.amazonaws.com/` (REST endpoints)!

### Cloudfront

- Origin domain name: trumped-frontend.s3.amazonaws.com
- Origin path: (null)
- Origin id: S3-trumped-frontend
- Restrict access: no
- Alternative domain names (CNAMEs): trumped.com, www.trumped.com, cdn.trumped.com
- SSL certificate: Default Cloudfront (\*.cloudfront.net)
- Default root object: index.html
- Extra:
  - Behaviors: `/` at precedence 0, forward query strings.
  - Error pages (403, 404) to direct to `/error.html`

### Elastic Beanstalk

- (Make sure you're in the same region you set the app up in!)
- https://us-west-2.console.aws.amazon.com/elasticbeanstalk/home?region=us-west-2#/environment/dashboard?applicationName=junglehorse-api&environmentId=e-bgpvm79qkt

Running the server
------------------

### Locally

1. Install Rust >= 1.1.0
2. `cargo run`

### On the Remote Dedicated Server (non-AWS)

1. Install and configure nginx as a reverse HTTP proxy.
2. SCP Rust server app binaries and start on required ports, ie.
   `trumpet -p PORT`.

Before moving to AWS, the DNS A records pointed to `209.239.112.74`,
which is the hostname `colossus960.startdedicated.com`.

### On AWS Infrastructure.

1. The frontend is hosted on AWS + Cloudfront.
2. The backend is hosted on Elastic Beanstalk (EBS).

The AWS setup is divided into two buckets: one that houses simply index.html,
which is hosted from `jungle.horse`. The other assets are distributed via 
Cloudfront, and are loaded from `cdn.jungle.horse`. There is some CORS header
setup work to do. (See the s3-cors and s3-bucket files for config.)

The backend is a docker image containing the compiled Rust binary, config file,
and sound files. It can be built into a zip with the `./ebs-deployable` script.
This is then uploaded via the EBS panel's front page (the "Upload and Deploy" 
button). This is hosted from `api.jungle.horse`.

Docker Notes
------------
Some notes for local management and testing of Docker images:

Build docker image from Dockerfile (in same working directory):

  `sudo docker build -t TAGNAME .`

Run docker image interactively with port forwarding to host machine:

  `sudo docker run -t -p 8000:8000 -i TAGNAME /bin/bash`

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

