import { expect, it } from "vitest";
import { cardPlayedNotification, playExpiredNotification, playRespondedNotification } from "./notifications";
it("builds a played-card notification pointing at the trip", () => {
  expect(cardPlayedNotification({ tripId: "t1", playId: "p1", attackerName: "Ana", cardName: "Hidalgo", minutes: 1 })).toEqual({ title: "Ana te ha lanzado Hidalgo", body: "Tienes 1 minuto para aceptar o reaccionar.", url: "/trips/t1", tag: "play-p1" });
});
it("describes each response outcome", () => {
  expect(playRespondedNotification({ tripId: "t", playId: "p", status: "REFLECTED", targetName: "Luis", cardName: "DJ", reactionName: "Rebote" }).title).toBe("Luis te ha devuelto DJ");
  expect(playRespondedNotification({ tripId: "t", playId: "p", status: "BLOCKED", targetName: "Luis", cardName: "DJ", reactionName: "Escudo" }).body).toMatch(/Escudo/);
  expect(playExpiredNotification({ tripId: "t", playId: "p", forAttacker: false, attackerName: "Ana", targetName: "Luis", cardName: "DJ" }).title).toBe("Se te ha aplicado DJ");
});
