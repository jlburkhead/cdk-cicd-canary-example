package main

import (
	"context"
	"net/http"
	"testing"

	"github.com/aws/aws-lambda-go/events"
	"github.com/stretchr/testify/assert"
)

func TestHandler(t *testing.T) {
	var request events.APIGatewayProxyRequest
	response, err := Handler(context.Background(), request)
	assert.NoError(t, err)
	assert.Equal(t, "Hello, World!", response.Body)
	assert.Equal(t, http.StatusOK, response.StatusCode)
}
