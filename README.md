# The Digital Evidence Preservation Toolkit

_(Or **DEPToolkit** for short. Bit of a mouthful otherwise)_

<div style="width:100%; display: flex; justify-content: center">
<img style="width: 70%" src="https://digitalevidencetoolkit.org/images/illustrations/architecture-full-curves.svg">
</div>

A proof-of-concept software for researchers and small teams sifting through online material. With only one click of the mouse, the material will be **archived in a framework demonstrating chain of custody and stored durably**. Once included in the growing database, users will be able to go back to search through and **annotate the material**, and to **export working copies** of said material for publication and dissemination.

A database built thusly can be handed to a prosecutor ten years down the line, and they will be able to say with mathematical certainty: “the material in this archive is identical and contemporary to the one saved at the time, ten years ago.”

Built with the support of **Prototype Fund**, the **German Federal Ministry for Education and Research**, the **Open Knowledge Foundation**, and **Amazon Web Services**.

### Architecture

The Docker Compose orchestration is composed of several services:

- An Express/TypeScript API,
- A plain JS browser extension
- And a frontend

To start the whole app:

```sh
$ docker-compose up
```

### Help & Contact

- [Getting started](https://digitalevidencetoolkit.notion.site/Getting-started-15521f4125534f4aa758a2575c27ad5c)
- [Technical documentation](https://digitalevidencetoolkit.notion.site/The-Digital-Evidence-Preservation-Toolkit-71eca0486bed46878dc478248488d23f)
- Email: basile at digitalevidencetoolkit dot org
