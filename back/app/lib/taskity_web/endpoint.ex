defmodule TaskityWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :taskity

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]
  plug Plug.Logger

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Absinthe.Plug,
    schema: TaskityWeb.Schema
end
