Design the web front end of a **travel booking site for stays**, like Airbnb.

Main journeys:

1. **Search**: destination (with autocomplete), check-in/check-out dates, number of guests. Results show as a
   list of listing cards **next to an interactive map**; moving the map updates results. Filters: price range,
   property type, amenities, instant book.
2. **Listing details**: photo gallery, description, amenities, host info, reviews, location map, an
   **availability calendar**, and a price breakdown for the chosen dates.
3. **Booking**: confirm dates and guests, see the final price, enter payment, send the reservation (instant book
   or request to book).

Constraints:

- Global audience: many currencies, languages (including RTL) and time zones.
- Listing and search pages bring in a lot of organic search traffic.
- Availability and prices change; two guests must not be able to book the same nights.
- Mobile web is more than half of traffic.

Focus on the client: architecture, state (especially URL state and dates), APIs, map + list sync, and the booking
flow's correctness.
