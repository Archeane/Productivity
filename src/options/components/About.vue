<template>
  <v-container fluid fillheight>
    <v-row dense>
      <h2 class="font-weight-light mr-auto ml-3">Support/FAQ</h2>
      <span class="subtitle-2 ml-auto mr-3">
        Have you find this tool useful? Please make a donation!
        <br />Any amount is appreciated 😁
      </span>
      <div>
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
          <input type="hidden" name="cmd" value="_donations" />
          <input type="hidden" name="business" value="EF6BJM8AY86QA" />
          <input type="hidden" name="currency_code" value="USD" />
          <input
            type="image"
            src="https://www.empowerhaititogether.org/wp-content/uploads/2016/10/Donate-Button-heart-300x97.png"
            border="0"
            height="40"
            name="submit"
            title="PayPal - The safer, easier way to pay online!"
            alt="Donate with PayPal button"
          />
          <img alt border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
        </form>
      </div>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-card outlined shaped>
          <v-card-title>Watch Sites</v-card-title>
          <v-card-text>Add sites you activetly want to reduce usage on, and track your progress over time!</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card outlined shaped>
          <v-card-title>Security & Privacy</v-card-title>
          <v-card-text>
            All Your data stays within your browser and can be accessed only through your google account.
            <br />There is no data being sent anywhere, anytime.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-card outlined shaped>
          <v-card-title>Why is this Free?</v-card-title>
          <v-card-text>This extension started for personal development purpose, and I wanted to share this tool so we can all become more productive!</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card outlined shaped>
          <v-card-title>Feedback</v-card-title>
          <v-card-text>
            Found a bug? Have a feature request?
            <a href="https://forms.gle/Wn3zLQwJwPWKyqqv8">Let me know</a>! You can also contribute to this project <a href="https://www.github.com/archeane/productivity">here</a>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-card outlined shaped>
          <v-card-title>Support</v-card-title>
          <v-card-text>
            Did you enjoy using this? Did this help you? Leave a review so others can see this too 😁 you can also energize me with ☕ so I can put out more awesome features for
            you! my venmo:
            <a href="https://venmo.com/Jenny-gone">jenny-gone</a> paypal: <a href="https://www.paypal.me/jennygone">paypal.me/jennygone</a>
          </v-card-text>
        </v-card>
        <v-card outlined shaped class="mt-5">
          <v-list-item twoline>
            <v-list-item-content>
              <v-card-title>About Me</v-card-title>
              <v-card-text>
                I'm a college student in New York who's always struggling with time management 😅 If you have any questions or suggestions, you can submit a
                <a href="https://forms.gle/Wn3zLQwJwPWKyqqv8">form</a> or shoot me a message on <a href="https://www.linkedin.com/in/xu-jenny">Linkedin</a>!
              </v-card-text>
            </v-list-item-content>
            <v-list-item-avatar size="100" color="grey"><v-img src="https://bit.ly/2YQQnd0"></v-img></v-list-item-avatar>
          </v-list-item>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card outlined shaped>
          <v-card-title>How can I best take advantage of this tool?</v-card-title>
          <v-card-text
            >Learn about your own browsing habits by taking advantage of the all the perspectives these charts offer. Each page should be able to answer these
            questions.</v-card-text
          >
          <v-card-actions>
            <p>
              <span class="subtitle-2">Dashboard -</span> which sites eats up your time? what % of time every day/week is spent on each site? which days in a week are you online
              the most? did you spend more time online this week or last week?
            </p>
            <p>
              <span class="subtitle-2">Watch Sites Overview -</span> did you reduce/increase watch sites time this week/month? which sites takes the most/least time? which sites
              improved/worsen? by how much?
            </p>
            <p>
              <span class="subtitle-2">Watch Sites Details -</span> when do you visit these watch sites? what time do you visit them? for how long? how long between each visit? how
              many times do you visit in a day?
            </p>
            <p><span class="subtitle-2">Usage Pattern -</span> what is every site you visit in a day, hour by hour? how was it different from yesterday, or last week?</p>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
