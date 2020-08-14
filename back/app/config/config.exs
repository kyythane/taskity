# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :taskity,
  ecto_repos: [Taskity.Repo]

# Configures the endpoint
config :taskity, TaskityWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "tYXpZ3sgU91ztLmJXRZZf0h4SyvHsTNmB3KmwxMKcttvjXmmilGBb3qCMsBg5V5o",
  render_errors: [view: TaskityWeb.ErrorView, accepts: ~w(json), layout: false],
  pubsub_server: Taskity.PubSub,
  live_view: [signing_salt: "dsqNE+Zu"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
