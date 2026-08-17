# Release-Checkliste

## Inhalt

- [ ] User Stories und Akzeptanzkriterien geprüft
- [ ] README beschreibt Chrome Extension als primären Nutzerweg
- [ ] Userscript ist als Legacy-Kompatibilität eingeordnet
- [ ] Berechtigungen und Datenschutz dokumentiert
- [ ] Upstream-Herkunft und Fork-Abweichungen dokumentiert
- [ ] Changelog-Eintrag ergänzt

## Qualität

- [ ] `corepack pnpm install --frozen-lockfile`
- [ ] `corepack pnpm lint`
- [ ] `corepack pnpm test`
- [ ] `corepack pnpm test:core`
- [ ] `corepack pnpm test:extension`
- [ ] `corepack pnpm build`
- [ ] `corepack pnpm release:build`

## Manuell

- [ ] `dist-release/.../extension` als entpackte Chrome-Extension geladen
- [ ] Normaler Chat als Raw-JSON heruntergeladen
- [x] Chat mit Bild als vollständiges Paket aus Raw-JSON, Markdown, Bilddatei und `media.json`-Zuordnung geprüft
- [ ] Nicht erreichbares Bild wird als `failed` dokumentiert, ohne den JSON-Export abzubrechen
- [ ] Fehlende/ungültige Unterhaltung zeigt verständlichen Fehler
- [ ] Endpoint-Berechtigung erscheint erst bei HTTP-Nutzung
- [ ] Endpoint-Test und expliziter Versand geprüft
- [ ] Ablehnung der Endpoint-Berechtigung lässt lokalen Download nutzbar

## Hygiene

- [ ] Keine privaten Chats oder Tokens im Diff
- [ ] Keine lokalen Pfade in Release-Dokumentation
- [ ] Lizenz und Attribution sichtbar
- [ ] Commit und Tag erstellt
- [ ] Release-Artefakte aus sauberem Checkout erzeugt
