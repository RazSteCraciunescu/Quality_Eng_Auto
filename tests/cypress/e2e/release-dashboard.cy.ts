describe("release dashboard", () => {
  it("sorts by risk and keeps the highest-risk release first", () => {
    cy.visit("/");
    cy.get("#release-count").should("contain", "3 releases");
    cy.get("#sort-select").select("riskScore-desc");
    cy.get(".release-card").first().within(() => {
      cy.get("h3").should("have.text", "Cirrus");
      cy.contains("94.3");
      cy.contains("blocked", { matchCase: false });
    });
  });

  it("returns a traceable 404 for an unknown release", () => {
    cy.request({ url: "/api/releases/not-real", failOnStatusCode: false }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body.error).to.eq("release_not_found");
      expect(response.headers).to.have.property("x-request-id");
    });
  });
});
